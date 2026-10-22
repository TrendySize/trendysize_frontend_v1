import { useEffect, useRef, useState } from "react";

import {
  Camera,
  Check,
  Compass,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MapPin,
  Moon,
  Phone,
  Plus,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

import DashboardSidebar from "../components/DashboardSidebar";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { InputField, InputWithIcon } from "../components/ProfileFormFields";
import { useTheme } from "../context/themeStore";
import {
  CRAFT_TAG_SUGGESTIONS,
  DEFAULT_PROFILE,
  MAX_PROFILE_IMAGE_SIZE,
  PROFILE_IMAGE_FIELDS,
  deriveSpecialtyLine,
  loadVendorData,
  persistProfile,
  useOverlay,
} from "../profileShared";
import { updateProfile, uploadProfileImage } from "../services/api";
import {
  createVendorProject,
  deleteVendorProject,
} from "../services/api";
import { dataUrlToBlob } from "../profileMediaStorage";
import { startGuidedTour } from "../onboarding";

function SectionCard({ title, description, children, dataTour }) {
  return (
    <section data-tour={dataTour} className="rounded-2xl border border-[var(--tk-border)] bg-[var(--tk-bg-elevated)] p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-[14px] font-bold text-[var(--tk-ink)] sm:text-[15px]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-[11px] text-[var(--tk-ink-muted)] sm:text-[12px]">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [selectedProfileMedia, setSelectedProfileMedia] = useState({});
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState("");
  const [selectedProductImage, setSelectedProductImage] = useState(null);

  const [toast, setToast] = useState(null);
  const [pendingProductDelete, setPendingProductDelete] = useState(null);
  const [pendingReset, setPendingReset] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const data = await loadVendorData();
      if (cancelled) return;
      setProfile(data.profile);
      setForm(data.profile);
      setProducts(data.products);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraOpen, cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const toggleCraftTag = (tag) => {
    setForm((previous) => {
      const current = Array.isArray(previous.craftTags)
        ? previous.craftTags
        : [];
      const next = current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag];
      return { ...previous, craftTags: next };
    });
  };

  const handleImageUpload = (event, field) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ message: "Please choose an image file.", tone: "error" });
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setToast({
        message: "Please choose an image smaller than 20MB.",
        tone: "error",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({ ...previous, [field]: reader.result }));
      setSelectedProfileMedia((previous) => ({ ...previous, [field]: file }));
    };

    reader.onerror = () => {
      console.error("Could not read selected profile image:", reader.error);
      setToast({
        message: "Could not read the selected image. Please try another file.",
        tone: "error",
      });
    };

    reader.readAsDataURL(file);
  };

  const normalisePortfolioUrl = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return "";
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    try {
      return new URL(withProtocol).toString();
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (saving) return;

    const portfolioUrl = normalisePortfolioUrl(form.portfolioUrl);
    if (portfolioUrl === null) {
      setToast({
        message: "Please enter a valid portfolio URL (e.g. https://…).",
        tone: "error",
      });
      return;
    }

    setSaving(true);

    try {
      let nextForm = { ...form, portfolioUrl };
      nextForm = { ...nextForm, specialtyLine: deriveSpecialtyLine(nextForm) };

      for (const field of PROFILE_IMAGE_FIELDS) {
        const selectedImage = selectedProfileMedia[field];
        if (selectedImage) {
          const type = field === "coverImage" ? "Banner" : "Profile";
          const result = await uploadProfileImage(selectedImage, type);
          const url = result?.url || result?.imageUrl;
          if (url) {
            nextForm = { ...nextForm, [field]: url };
          }
        }
      }

      const [firstName] = (form.whatsappName || form.businessName || "")
        .trim()
        .split(/\s+/);

      await updateProfile({
        FirstName: firstName || undefined,
        PhoneNumber: form.phone || undefined,
        WhatsappNumber: form.whatsappNumber || undefined,
        BusinessName: form.businessName || undefined,
        Tagline: form.tagline || undefined,
        Description: form.description || undefined,
        City: form.city || undefined,
        Region: form.region || undefined,
        Specialization: form.specialization || undefined,
        WhatsappName: form.whatsappName || undefined,
        PortfolioUrl: portfolioUrl || undefined,
        CraftTags: Array.isArray(form.craftTags) ? form.craftTags : undefined,
        OutfitsMade: form.outfitsMade === "" ? undefined : Number(form.outfitsMade),
        YearsExperience:
          form.yearsExperience === "" ? undefined : Number(form.yearsExperience),
      });

      persistProfile(nextForm);
      setForm(nextForm);
      setProfile(nextForm);
      setSelectedProfileMedia({});
      setToast({ message: "Your settings were saved.", tone: "success" });
    } catch (error) {
      console.error("Could not save settings:", error);
      setToast({
        message:
          error?.message || "Could not save your settings. Please try again.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const requestReset = () => setPendingReset(true);

  const confirmReset = () => {
    setPendingReset(false);
    setForm(profile);
    setSelectedProfileMedia({});
    setToast({ message: "Unsaved changes discarded.", tone: "success" });
  };

  const openProductModal = () => {
    setProductName("");
    setProductImage("");
    setSelectedProductImage(null);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setProductName("");
    setProductImage("");
    setSelectedProductImage(null);
    setShowProductModal(false);
  };

  const productModalRef = useOverlay(showProductModal, closeProductModal);
  const cameraDialogRef = useOverlay(cameraOpen, closeCamera);

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ message: "Please choose an image file.", tone: "error" });
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setToast({
        message: "Please choose an image smaller than 20MB.",
        tone: "error",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProductImage(reader.result);
      setSelectedProductImage(file);
    };

    reader.onerror = () => {
      console.error("Could not read selected product image:", reader.error);
      setToast({
        message: "Could not read the selected image. Please try another file.",
        tone: "error",
      });
    };

    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setToast({
          message: "Camera access is not supported by this browser.",
          tone: "error",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      setCameraStream(stream);
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        setToast({
          message:
            "Camera permission was denied. Please allow camera access in your browser settings.",
          tone: "error",
        });
      } else {
        setToast({ message: "Unable to access the camera.", tone: "error" });
      }
    }
  };

  function closeCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraOpen(false);
  }

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.videoWidth || !video.videoHeight) {
      setToast({
        message: "Camera is still loading. Please try again.",
        tone: "error",
      });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setProductImage(canvas.toDataURL("image/jpeg", 0.9));
    setSelectedProductImage(null);
    closeCamera();
  };

  const handleAddProduct = async () => {
    if (!productName.trim()) {
      setToast({ message: "Please enter a product name.", tone: "error" });
      return;
    }

    if (!productImage) {
      setToast({ message: "Please add a product picture.", tone: "error" });
      return;
    }

    try {
      const file =
        selectedProductImage || dataUrlToBlob(productImage) || undefined;

      const created = await createVendorProject({
        name: productName.trim(),
        file,
      });

      const newProduct = {
        id: created?.id ?? created?.Id,
        name: created?.name ?? created?.Name ?? productName.trim(),
        image: created?.imageUrl ?? created?.ImageUrl ?? productImage,
      };
      const updatedProducts = [...products, newProduct];

      setProducts(updatedProducts);
      closeProductModal();
      setToast({ message: "Look added to Featured Work.", tone: "success" });
    } catch (error) {
      console.error("Could not save featured look:", error);
      setToast({
        message:
          error?.message ||
          "Could not save the look. Please try again.",
        tone: "error",
      });
    }
  };

  const handleDeleteProduct = (productId) => setPendingProductDelete(productId);

  const confirmDeleteProduct = async () => {
    const productId = pendingProductDelete;
    setPendingProductDelete(null);

    if (!productId) return;

    const updatedProducts = products.filter(
      (product) => product.id !== productId
    );

    try {
      await deleteVendorProject(productId);
      setProducts(updatedProducts);
      setToast({ message: "Look removed.", tone: "success" });
    } catch (error) {
      console.error("Could not delete featured look:", error);
      setToast({
        message: error?.message || "Could not remove this look. Please try again.",
        tone: "error",
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-[var(--tk-ink)]">
      <DashboardSidebar activeLabel="Settings" />

      <main className="relative z-10 ml-0 min-h-screen px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 lg:ml-[240px] lg:px-7 lg:pb-14 lg:pt-5">
        <div className="mx-auto max-w-[820px]">
          {/* HEADER */}
          <header className="mb-5 sm:mb-7">
            <h1 className="text-[21px] font-bold leading-tight text-[var(--tk-ink)] sm:text-[24px]">
              Settings
            </h1>
            <p className="mt-1 text-[12px] text-[var(--tk-ink-muted)] sm:text-[13px]">
              Set up how your atelier appears across TrendySize.
            </p>
          </header>

          <div className="space-y-5 sm:space-y-6">
            {/* APPEARANCE */}
            <SectionCard
              title="Appearance"
              description="Choose how the dashboard looks on this device."
              dataTour="settings-workspace"
            >
              <div className="grid grid-cols-2 gap-3 sm:max-w-[360px]">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  aria-pressed={theme === "light"}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-semibold transition ${
                    theme === "light"
                      ? "border-[var(--tk-brand)] bg-[var(--tk-brand)] text-[var(--tk-brand-ink)]"
                      : "border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)] text-[var(--tk-ink)] hover:bg-[var(--tk-surface)]"
                  }`}
                >
                  <Sun size={16} />
                  Light
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  aria-pressed={theme === "dark"}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-semibold transition ${
                    theme === "dark"
                      ? "border-[var(--tk-brand)] bg-[var(--tk-brand)] text-[var(--tk-brand-ink)]"
                      : "border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)] text-[var(--tk-ink)] hover:bg-[var(--tk-surface)]"
                  }`}
                >
                  <Moon size={16} />
                  Dark
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--tk-border)] bg-[var(--tk-surface-muted)] px-4 py-3">
                <span className="text-[12px] font-medium text-[var(--tk-ink)] sm:text-[13px]">
                  Quick toggle
                </span>
                <ThemeToggle />
              </div>
            </SectionCard>

            {/* BUSINESS IMAGES */}
            <SectionCard
              title="Business Images"
              description="JPG, PNG or WEBP. Maximum 20MB each."
            >
              {/* PROFILE PICTURE */}
              <div className="mb-6 flex items-center gap-3 sm:gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-surface)] text-center text-[9px] font-semibold text-[var(--tk-brand)] sm:h-20 sm:w-20">
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Add Business Picture"
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--tk-ink)] sm:text-[14px]">
                    Business Picture
                  </p>

                  <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--tk-brand)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--tk-brand)] transition hover:bg-[var(--tk-surface)] sm:px-3 sm:py-2 sm:text-[12px]">
                    <Camera size={12} />
                    Upload Picture
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Change business picture"
                      className="hidden"
                      onChange={(event) =>
                        handleImageUpload(event, "profileImage")
                      }
                    />
                  </label>
                </div>
              </div>

              {/* COVER IMAGE */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[var(--tk-ink)] sm:text-[14px]">
                  Cover Image
                </label>

                <div className="relative h-[110px] overflow-hidden rounded-lg border border-[var(--tk-border-strong)] bg-[var(--tk-brand)] sm:h-[140px]">
                  {form.coverImage ? (
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[var(--tk-brand)] bg-gradient-to-b from-white/[0.08] to-black/[0.12] text-[11px] text-white/70 sm:text-[14px]">
                      Add Cover Image
                    </div>
                  )}

                  <label className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-[var(--tk-brand)] shadow sm:px-2.5 sm:py-1.5 sm:text-[12px]">
                    <Camera size={11} />
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Change cover image"
                      className="hidden"
                      onChange={(event) =>
                        handleImageUpload(event, "coverImage")
                      }
                    />
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* GENERAL INFORMATION */}
            <SectionCard
              title="General Information"
              description="The identity customers see on your profile."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Business Name"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Add Business Name"
                  maxLength={80}
                />

                <InputField
                  label="Tagline"
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  placeholder="e.g. Bespoke tailoring since 2015"
                  maxLength={120}
                  hint="A short line that captures what makes your atelier special."
                />

                <div className="sm:col-span-2">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="description"
                      className="block text-[12px] font-semibold text-[var(--tk-ink)] sm:text-[14px]"
                    >
                      Business Description
                    </label>

                    <span
                      className={`text-[10px] tabular-nums sm:text-[11px] ${
                        (form.description || "").length >= 500
                          ? "text-red-500"
                          : "text-[var(--tk-ink-muted)]"
                      }`}
                    >
                      {(form.description || "").length}/500
                    </span>
                  </div>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Tell customers about your atelier, your craft and the kind of pieces you create."
                    rows={4}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-[var(--tk-border-strong)] px-3 py-2.5 text-[13px] text-[var(--tk-ink)] outline-none transition placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)] focus:ring-2 focus:ring-[var(--tk-brand)]/10 sm:text-[14px]"
                  />
                </div>
              </div>
            </SectionCard>

            {/* LOCATION */}
            <SectionCard
              title="Location"
              description="Where your atelier is based — shown under your business name."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputWithIcon
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  icon={<MapPin size={15} />}
                  placeholder="e.g. Lagos"
                  maxLength={60}
                />

                <InputField
                  label="State / Region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="e.g. Lagos State"
                  maxLength={60}
                />
              </div>
            </SectionCard>

            {/* SPECIALIZATION */}
            <SectionCard
              title="Specialization"
              description="What you're known for. Pick the pieces you make most — they appear as tags on your profile."
            >
              <div className="mb-4">
                <InputField
                  label="Primary Specialization"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Bespoke Senator, Agbada & Bridal"
                  maxLength={90}
                  hint="A short summary of your craft, shown next to your location."
                />
              </div>

              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--tk-ink-muted)] sm:text-[12px]">
                Craft Tags
              </div>

              <div className="flex flex-wrap gap-2">
                {CRAFT_TAG_SUGGESTIONS.map((tag) => {
                  const selected = (form.craftTags || []).includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCraftTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition sm:text-[12px] ${
                        selected
                          ? "border-[var(--tk-brand)] bg-[var(--tk-brand)] text-[var(--tk-brand-ink)]"
                          : "border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)] text-[var(--tk-ink)] hover:bg-[var(--tk-surface)]"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* WHATSAPP */}
            <SectionCard
              title="WhatsApp Information"
              description="Used for the chat button customers tap."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputWithIcon
                  label="WhatsApp Name"
                  name="whatsappName"
                  value={form.whatsappName}
                  onChange={handleChange}
                  icon={<FaWhatsapp size={15} aria-hidden="true" />}
                  placeholder="Add WhatsApp Name"
                />

                <InputWithIcon
                  label="WhatsApp Number"
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  icon={<Phone size={15} />}
                  placeholder="e.g. 2348012345678"
                  type="tel"
                  inputMode="tel"
                  hint="Include country code, without a leading 0 (e.g. 2348012345678)."
                />
              </div>
            </SectionCard>

            {/* CONTACT */}
            <SectionCard
              title="Contact Information"
              description="How customers can reach you."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Add Phone Number"
                  type="tel"
                  inputMode="tel"
                />

                <InputWithIcon
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  icon={<Mail size={15} />}
                  placeholder="Add Email Address"
                  type="email"
                  inputMode="email"
                />

                <div className="sm:col-span-2">
                  <InputWithIcon
                    label="Portfolio URL"
                    name="portfolioUrl"
                    value={form.portfolioUrl}
                    onChange={handleChange}
                    icon={<ExternalLink size={15} />}
                    placeholder="Add Portfolio URL"
                    type="url"
                    inputMode="url"
                    hint="We'll add https:// if you leave it out."
                  />
                </div>
              </div>
            </SectionCard>

            {/* STATISTICS */}
            <SectionCard
              title="Business Statistics"
              description="Highlights shown on your profile."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Outfits Made"
                  name="outfitsMade"
                  value={form.outfitsMade}
                  onChange={handleChange}
                  placeholder="Add Number"
                  type="number"
                  inputMode="numeric"
                  min="0"
                />

                <InputField
                  label="Years Experience"
                  name="yearsExperience"
                  value={form.yearsExperience}
                  onChange={handleChange}
                  placeholder="Add Number"
                  type="number"
                  inputMode="numeric"
                  min="0"
                />
              </div>
            </SectionCard>

            {/* FEATURED WORK */}
            <SectionCard
              title="Featured Work"
              description="Looks from your atelier shown on your profile."
            >
              {products.length === 0 ? (
                <button
                  type="button"
                  onClick={openProductModal}
                  className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--tk-brand)] bg-[var(--tk-surface)] text-[var(--tk-brand)] transition hover:bg-[var(--tk-hover)]"
                >
                  <Plus size={21} />
                  <span className="mt-2 text-[11px] font-semibold sm:text-[12px]">
                    Add Look
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group overflow-hidden rounded-xl border border-[var(--tk-border-strong)] bg-[var(--tk-bg-elevated)]"
                    >
                      <div className="relative h-[135px] bg-[var(--tk-surface)] sm:h-[150px]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          title="Remove look"
                          aria-label={`Remove ${product.name}`}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="p-2.5">
                        <p className="truncate text-[12px] font-semibold text-[var(--tk-ink)] sm:text-[13px]">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={openProductModal}
                    className="flex min-h-[165px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--tk-brand)] bg-[var(--tk-surface)] text-[var(--tk-brand)] transition hover:bg-[var(--tk-hover)] sm:min-h-[180px]"
                  >
                    <Plus size={21} />
                    <span className="mt-2 text-[11px] font-semibold sm:text-[12px]">
                      Add Look
                    </span>
                  </button>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Guided tour"
              description="A refresher on where every feature lives."
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[430px] text-[11px] leading-5 text-[var(--tk-ink-muted)] sm:text-[12px]">
                  Walk through the dashboard, customers, measurement links,
                  storefront, subscription and support. You can skip it at any
                  time and restart it later from here.
                </p>

                <button
                  type="button"
                  onClick={startGuidedTour}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--tk-brand)] px-4 text-[11px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 sm:text-[12px]"
                >
                  <Compass size={15} />
                  Retake tour
                </button>
              </div>
            </SectionCard>
          </div>

          {/* SAVE BAR */}
          <div className="tk-glass tk-glass-line sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 mt-6 flex items-center justify-end gap-2 rounded-xl border border-[var(--tk-glass-border)] p-3 shadow-lg lg:bottom-4">
            <button
              type="button"
              onClick={requestReset}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--tk-surface)] px-3 py-2.5 text-[12px] font-semibold text-[var(--tk-ink)] transition hover:bg-[var(--tk-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-[13px]"
            >
              <RotateCcw size={14} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              aria-busy={saving}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--tk-brand)] px-4 py-2.5 text-[12px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:px-5 sm:text-[13px]"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* ADD LOOK MODAL */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-3 py-4 sm:px-4"
          onClick={closeProductModal}
        >
          <div
            ref={productModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[95vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-[var(--tk-bg-elevated)] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[var(--tk-border)] px-4 py-4 sm:px-6 sm:py-5">
              <div className="pr-3">
                <h2
                  id="add-product-title"
                  className="text-[17px] font-bold text-[var(--tk-ink)] sm:text-lg"
                >
                  Add Look
                </h2>
                <p className="mt-1 text-[11px] text-[var(--tk-ink-muted)] sm:text-[14px]">
                  Add a picture of your work to your portfolio
                </p>
              </div>

              <button
                type="button"
                onClick={closeProductModal}
                aria-label="Close add look"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-surface-muted)] text-[var(--tk-ink)] transition hover:bg-[var(--tk-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-brand)]/50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="relative mb-4 flex h-[180px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[var(--tk-border-strong)] bg-[var(--tk-surface-muted)] sm:mb-5 sm:h-[210px] lg:h-[240px]">
                {productImage ? (
                  <img
                    src={productImage}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="px-3 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-surface)] text-[var(--tk-brand)] sm:h-14 sm:w-14">
                      <ImageIcon size={25} />
                    </div>
                    <p className="mt-2.5 text-[13px] font-semibold text-[var(--tk-ink)] sm:mt-3 sm:text-[14px]">
                      Add look picture
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--tk-ink-muted)] sm:text-[12px]">
                      Choose a picture or use your camera
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--tk-brand)] bg-[var(--tk-bg-elevated)] py-2.5 text-[11px] font-semibold text-[var(--tk-brand)] transition hover:bg-[var(--tk-surface)] sm:gap-2 sm:py-3 sm:text-[14px]">
                  <ImageIcon size={15} />
                  Choose Picture
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProductImageUpload}
                  />
                </label>

                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--tk-brand)] py-2.5 text-[11px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 sm:gap-2 sm:py-3 sm:text-[14px]"
                >
                  <Camera size={15} />
                  Take Picture
                </button>
              </div>

              <div className="mt-4 sm:mt-5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label
                    htmlFor="productName"
                    className="block text-[12px] font-semibold text-[var(--tk-ink)] sm:text-[14px]"
                  >
                    Look Name
                  </label>
                  <span
                    className={`text-[10px] tabular-nums sm:text-[11px] ${
                      productName.length >= 60
                        ? "text-red-500"
                        : "text-[var(--tk-ink-muted)]"
                    }`}
                  >
                    {productName.length}/60
                  </span>
                </div>

                <input
                  id="productName"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="e.g. Senator Outfit"
                  maxLength={60}
                  className="w-full rounded-lg border border-[var(--tk-border-strong)] px-3 py-2.5 text-[13px] text-[var(--tk-ink)] outline-none placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)] focus:ring-2 focus:ring-[var(--tk-brand)]/10 sm:py-3 sm:text-[14px]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!productImage || !productName.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--tk-brand)] py-2.5 text-[12px] font-semibold text-[var(--tk-brand-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-5 sm:py-3 sm:text-[14px]"
              >
                <Plus size={14} />
                Add to Featured Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CAMERA */}
      {cameraOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-2 py-3 sm:px-4"
          onClick={closeCamera}
        >
          <div
            ref={cameraDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="camera-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[650px] overflow-hidden rounded-xl bg-[var(--tk-bg-elevated)] shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between bg-[#241065] px-4 py-3 text-white sm:px-5 sm:py-4">
              <div className="min-w-0 pr-3">
                <h2 id="camera-title" className="text-[13px] font-bold sm:text-sm">
                  Take Look Picture
                </h2>
                <p className="mt-1 truncate text-[10px] text-white/60 sm:text-[12px]">
                  Position your outfit inside the frame
                </p>
              </div>

              <button
                type="button"
                onClick={closeCamera}
                aria-label="Close camera"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X size={17} />
              </button>
            </div>

            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-[4/3] w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-white/60 sm:inset-6">
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/40 sm:h-40 sm:w-40" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-5 bg-[#241065] px-4 py-4 sm:gap-6 sm:px-5 sm:py-5">
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-lg bg-white/10 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-white/20 sm:px-5 sm:text-[14px]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[var(--tk-brand)] text-[var(--tk-brand-ink)] shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                title="Take picture"
                aria-label="Take picture"
              >
                <Camera size={23} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingProductDelete)}
        title="Remove look"
        description="Remove this look from Featured Work?"
        confirmLabel="Remove"
        tone="danger"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setPendingProductDelete(null)}
      />

      <ConfirmDialog
        open={pendingReset}
        title="Discard changes"
        description="Discard your unsaved changes?"
        confirmLabel="Discard"
        tone="danger"
        onConfirm={confirmReset}
        onCancel={() => setPendingReset(false)}
      />
    </div>
  );
}
