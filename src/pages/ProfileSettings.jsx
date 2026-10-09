import { useEffect, useRef, useState } from "react";

import {
  Award,
  Camera,
  Check,
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  Mail,
  Menu,
  Pencil,
  Phone,
  Plus,
  Shirt,
  X,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

import DashboardSidebar from "../components/DashboardSidebar";
import drawerLogo from "../assets/images/nav.png";
import {
  deleteProfileMedia,
  dataUrlToBlob,
  getStoredProducts,
  hydrateProductImages,
  loadProfileMedia,
  readBlobAsDataUrl,
  saveProfileMedia,
} from "../profileMediaStorage";

// ======================================================
// DEFAULT PROFILE
// ======================================================

const DEFAULT_PROFILE = {
  businessName: "",
  tagline: "",
  description: "",
  whatsappName: "",
  whatsappNumber: "",
  phone: "",
  email: "",
  portfolioUrl: "",
  profileImage: "",
  coverImage: "",
  happyClients: "",
  outfitsMade: "",
  yearsExperience: "",
};

const MEASUREMENT_LINK_KEY =
  "trendySize_active_measurement_link";
const PROFILE_IMAGE_FIELDS = ["profileImage", "coverImage"];
const MAX_PROFILE_IMAGE_SIZE = 20 * 1024 * 1024;

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function ProfileSettings() {
  // ====================================================
  // PROFILE STATE
  // ====================================================

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [selectedProfileMedia, setSelectedProfileMedia] = useState({});
  const [editing, setEditing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ====================================================
  // MEASUREMENT LINK STATE
  // ====================================================

  const [measurementLink, setMeasurementLink] =
    useState(null);

  // ====================================================
  // PRODUCT STATE
  // ====================================================

  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] =
    useState(false);
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState("");
  const [selectedProductImage, setSelectedProductImage] = useState(null);

  // ====================================================
  // CAMERA STATE
  // ====================================================

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  // ====================================================
  // LOAD PROFILE + PRODUCTS
  // ====================================================

  useEffect(() => {
    let cancelled = false;

    const savedProfile = localStorage.getItem(
      "trendySize_profile"
    );

    const savedProducts = localStorage.getItem(
      "trendySize_products"
    );

    const loadProfile = async () => {
      let updatedProfile = DEFAULT_PROFILE;

      if (savedProfile) {
        try {
          updatedProfile = {
            ...DEFAULT_PROFILE,
            ...JSON.parse(savedProfile),
          };
        } catch (error) {
          console.error("Could not load profile:", error);
        }
      }

      try {
        let migrated = false;

        for (const field of PROFILE_IMAGE_FIELDS) {
          if (updatedProfile[field]?.startsWith("data:")) {
            await saveProfileMedia(
              field,
              dataUrlToBlob(updatedProfile[field])
            );
            migrated = true;
          }

          const storedImage = await loadProfileMedia(field);
          if (storedImage) {
            updatedProfile[field] = await readBlobAsDataUrl(storedImage);
          }
        }

        if (migrated) {
          const storedProfile = { ...updatedProfile };
          PROFILE_IMAGE_FIELDS.forEach((field) => {
            storedProfile[field] = "";
          });
          localStorage.setItem(
            "trendySize_profile",
            JSON.stringify(storedProfile)
          );
        }
      } catch (error) {
        console.error("Could not load profile images:", error);
      }

      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          if (!Array.isArray(parsedProducts)) {
            throw new Error("Saved products must be an array.");
          }
          const {
            products: loadedProducts,
            migrated,
          } = await hydrateProductImages(parsedProducts);

          if (migrated) {
            localStorage.setItem(
              "trendySize_products",
              JSON.stringify(getStoredProducts(loadedProducts))
            );
          }

          if (!cancelled) {
            setProducts(loadedProducts);
          }
        } catch (error) {
          console.error("Could not load products:", error);
        }
      }

      if (!cancelled) {
        setProfile(updatedProfile);
        setForm(updatedProfile);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // ====================================================
  // LOAD ACTIVE MEASUREMENT LINK
  // ====================================================

  useEffect(() => {
    const loadMeasurementLink = () => {
      const savedLink = localStorage.getItem(
        MEASUREMENT_LINK_KEY
      );

      if (!savedLink) {
        setMeasurementLink(null);
        return;
      }

      try {
        const parsedLink = JSON.parse(savedLink);

        if (parsedLink?.link && !parsedLink?.used) {
          setMeasurementLink(parsedLink);
        } else {
          localStorage.removeItem(MEASUREMENT_LINK_KEY);
          setMeasurementLink(null);
        }
      } catch (error) {
        console.error(
          "Could not load measurement link:",
          error
        );

        localStorage.removeItem(MEASUREMENT_LINK_KEY);
        setMeasurementLink(null);
      }
    };

    loadMeasurementLink();

    const handleStorageChange = (event) => {
      if (event.key === MEASUREMENT_LINK_KEY) {
        loadMeasurementLink();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    const interval = setInterval(
      loadMeasurementLink,
      500
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      clearInterval(interval);
    };
  }, []);

  // ====================================================
  // CONNECT CAMERA STREAM TO VIDEO
  // ====================================================

  useEffect(() => {
    if (
      cameraOpen &&
      videoRef.current &&
      cameraStream
    ) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraOpen, cameraStream]);

  // ====================================================
  // CLEAN CAMERA WHEN COMPONENT UNMOUNTS
  // ====================================================

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [cameraStream]);

  // ====================================================
  // HANDLE FORM CHANGE
  // ====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ====================================================
  // PROFILE / COVER IMAGE UPLOAD
  // ====================================================

  const handleImageUpload = (event, field) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      alert(
        "Please choose an image smaller than 20MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        [field]: reader.result,
      }));
      setSelectedProfileMedia((previous) => ({
        ...previous,
        [field]: file,
      }));
    };

    reader.onerror = () => {
      console.error("Could not read selected profile image:", reader.error);
      alert("Could not read the selected image. Please try another file.");
    };

    reader.readAsDataURL(file);
  };

  // ====================================================
  // SAVE PROFILE
  // ====================================================

  const handleSave = async () => {
    try {
      for (const field of PROFILE_IMAGE_FIELDS) {
        const selectedImage = selectedProfileMedia[field];
        if (selectedImage) {
          await saveProfileMedia(field, selectedImage);
        }
      }

      const storedProfile = { ...form };
      PROFILE_IMAGE_FIELDS.forEach((field) => {
        storedProfile[field] = "";
      });
      localStorage.setItem(
        "trendySize_profile",
        JSON.stringify(storedProfile)
      );

      setProfile(form);
      setSelectedProfileMedia({});
      setEditing(false);
    } catch (error) {
      console.error("Could not save profile images:", error);
      alert("Could not save the image. Please check available browser storage and try again.");
    }
  };

  // ====================================================
  // CANCEL PROFILE EDIT
  // ====================================================

  const handleCancel = () => {
    setForm(profile);
    setSelectedProfileMedia({});
    setEditing(false);
  };

  // ====================================================
  // OPEN MEASUREMENT LINK
  // ====================================================

  const handleMeasurementLink = () => {
    if (!measurementLink?.link) {
      return;
    }

    window.open(
      measurementLink.link,
      "_blank",
      "noopener,noreferrer"
    );

    localStorage.removeItem(
      MEASUREMENT_LINK_KEY
    );

    setMeasurementLink(null);
  };

  // ====================================================
  // OPEN ADD PRODUCT MODAL
  // ====================================================

  const openProductModal = () => {
    setProductName("");
    setProductImage("");
    setSelectedProductImage(null);
    setShowProductModal(true);
  };

  // ====================================================
  // CLOSE ADD PRODUCT MODAL
  // ====================================================

  const closeProductModal = () => {
    setProductName("");
    setProductImage("");
    setSelectedProductImage(null);
    setShowProductModal(false);
  };

  // ====================================================
  // PRODUCT IMAGE FROM DEVICE
  // ====================================================

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      alert("Please choose an image smaller than 20MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProductImage(reader.result);
      setSelectedProductImage(file);
    };

    reader.onerror = () => {
      console.error("Could not read selected product image:", reader.error);
      alert("Could not read the selected image. Please try another file.");
    };

    reader.readAsDataURL(file);
  };

  // ====================================================
  // OPEN LIVE CAMERA
  // ====================================================

  const openCamera = async () => {
    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert(
          "Camera access is not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
          audio: false,
        });

      setCameraStream(stream);
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        alert(
          "Camera permission was denied. Please allow camera access in your browser settings."
        );
      } else {
        alert("Unable to access the camera.");
      }
    }
  };

  // ====================================================
  // CLOSE LIVE CAMERA
  // ====================================================

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setCameraStream(null);
    setCameraOpen(false);
  };

  // ====================================================
  // TAKE CAMERA PICTURE
  // ====================================================

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video) return;

    if (!video.videoWidth || !video.videoHeight) {
      alert(
        "Camera is still loading. Please try again."
      );

      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL(
      "image/jpeg",
      0.9
    );

    setProductImage(image);
    setSelectedProductImage(null);

    closeCamera();
  };

  // ====================================================
  // ADD PRODUCT
  // ====================================================

  const handleAddProduct = async () => {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!productImage) {
      alert("Please add a product picture.");
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const imageKey = `product:${id}`;

    try {
      await saveProfileMedia(
        imageKey,
        selectedProductImage || dataUrlToBlob(productImage)
      );

      const newProduct = {
        id,
        imageKey,
        name: productName.trim(),
        image: productImage,
      };
      const updatedProducts = [...products, newProduct];

      localStorage.setItem(
        "trendySize_products",
        JSON.stringify(getStoredProducts(updatedProducts))
      );
      setProducts(updatedProducts);
      closeProductModal();
    } catch (error) {
      console.error("Could not save product image:", error);
      alert("Could not save the product image. Please check available browser storage and try again.");
    }
  };

  // ====================================================
  // DELETE PRODUCT
  // ====================================================

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Remove this product from Featured Work?"
    );

    if (!confirmed) return;

    const productToDelete = products.find(
      (product) => product.id === productId
    );
    const updatedProducts = products.filter(
      (product) => product.id !== productId
    );

    try {
      if (productToDelete?.imageKey) {
        await deleteProfileMedia(productToDelete.imageKey);
      }
      localStorage.setItem(
        "trendySize_products",
        JSON.stringify(getStoredProducts(updatedProducts))
      );
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Could not delete product image:", error);
      alert("Could not remove this product. Please try again.");
    }
  };

  // ====================================================
  // WHATSAPP LINK
  // ====================================================

  const whatsappNumber =
    profile.whatsappNumber?.replace(/\D/g, "");

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "#";

  // ====================================================
  // JSX
  // ====================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F3FF] text-[#241065]">

      {/* ==================================================
          SIDEBAR
      =================================================== */}

      <DashboardSidebar
        activeLabel="Profile & Settings"
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* MOBILE MENU */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#EAE7FF] text-[#241065] lg:hidden"
      >
        <Menu size={21} strokeWidth={2} />
      </button>

      {/* MOBILE LOGO */}
      <button
        type="button"
        aria-label="Go to dashboard"
        onClick={() => {
          window.location.href = "/dashboard";
        }}
        className="fixed left-[60px] top-3 z-20 flex items-center lg:hidden"
      >
        <img
          src={drawerLogo}
          alt=""
          className="h-9 w-9 object-contain max-[380px]:h-8 max-[380px]:w-8"
        />

        <span className="-ml-1 text-[14px] font-extrabold text-[#241065] max-[380px]:text-[13px]">
          TRENDY
          <span className="text-[#9B8AFB]">
            SIZE
          </span>
        </span>
      </button>

      {/* MOBILE SIGN IN */}
      <button
        type="button"
        onClick={() => {
          window.location.href = "/signin";
        }}
        className="fixed right-3 top-[22px] z-20 text-[12px] font-semibold text-[#6133DA] sm:right-4 sm:text-[13px] lg:hidden"
      >
        Sign in
      </button>

      {/* ==================================================
          MAIN
      =================================================== */}

      <main className="ml-0 min-h-screen px-3 pb-10 pt-16 sm:px-4 sm:pb-14 sm:pt-14 lg:ml-[240px] lg:px-7 lg:pb-14 lg:pt-0">

        <div className="mx-auto max-w-[1180px]">

          {/* ==================================================
              COVER + PROFILE
          ================================================== */}

          <section>

            {/* COVER */}

            <div className="relative h-[120px] overflow-hidden rounded-t-[18px] bg-[#6133DA] shadow-[0_10px_30px_rgba(36,16,101,0.08)] sm:h-[135px] lg:h-[170px] lg:rounded-t-[22px]">

              {profile.coverImage ? (
                <img
                  src={profile.coverImage}
                  alt="Business cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative h-full w-full overflow-hidden bg-gradient-to-r from-[#241065] via-[#6133DA] to-[#241065]">

                  <div className="absolute -left-8 -top-14 h-56 w-40 rotate-12 rounded-full bg-white/10 blur-2xl" />

                  <div className="absolute left-[34%] -top-12 h-64 w-52 -rotate-12 rounded-full bg-white/10 blur-2xl" />

                  <div className="absolute right-8 -top-10 h-56 w-44 rotate-[25deg] rounded-full bg-white/10 blur-2xl" />

                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-[#241065]/20 via-transparent to-[#241065]/25" />

              {profile.businessName?.trim() && (
                <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[9px] font-medium text-[#6133DA] shadow-sm backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px] lg:right-5 lg:top-4 lg:gap-2 lg:px-3 lg:py-1.5 lg:text-[11px]">

                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6133DA] text-white sm:h-5 sm:w-5">
                    <Check
                      size={9}
                      strokeWidth={3}
                    />
                  </span>

                  <span>
                    Verified Fashion Business
                  </span>

                </div>
              )}

              {editing && (
                <label className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10px] font-medium text-[#6133DA] shadow-lg sm:bottom-3 sm:right-3 sm:px-3 sm:py-2 sm:text-[12px] lg:text-[14px]">

                  <Camera size={13} />

                  Change Cover

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleImageUpload(
                        event,
                        "coverImage"
                      )
                    }
                  />

                </label>
              )}

            </div>

            {/* PROFILE PICTURE */}

            <div className="relative z-10 -mt-[58px] flex justify-center sm:-mt-[65px] lg:-mt-[85px]">

              <div className="relative">

                <div className="h-[112px] w-[112px] overflow-hidden rounded-full border-[5px] border-[#F4F3FF] bg-[#EBE9FE] shadow-[0_12px_30px_rgba(36,16,101,0.18)] sm:h-[125px] sm:w-[125px] lg:h-[160px] lg:w-[160px] lg:border-[6px]">

                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.businessName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] font-semibold text-[#6133DA] sm:text-[11px] lg:text-[12px]">
                      Add Business Picture
                    </div>
                  )}

                </div>

                {editing && (
                  <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#6133DA] text-white shadow-md lg:h-7 lg:w-7">

                    <Camera size={13} />

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        handleImageUpload(
                          event,
                          "profileImage"
                        )
                      }
                    />

                  </label>
                )}

              </div>

            </div>

            {/* BUSINESS INFORMATION */}

            <div className="relative mx-auto mt-4 max-w-[680px] px-2 text-center sm:mt-5 lg:mt-6 lg:px-0">

              <div className="flex items-center justify-center gap-1.5 sm:gap-2">

                <h1 className="max-w-[80%] truncate text-[18px] font-bold text-[#241065] sm:text-[20px] lg:max-w-none lg:text-[22px]">
                  {profile.businessName ||
                    "Add Business Name"}
                </h1>

                {profile.businessName?.trim() && (
                  <span
                    title="Verified Fashion Business"
                    aria-label="Verified Fashion Business"
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#6133DA] text-white sm:h-5 sm:w-5"
                  >
                    <Check
                      size={11}
                      strokeWidth={3}
                    />
                  </span>
                )}

              </div>

              {/* DESKTOP EDIT BUTTON */}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-[#D8D6FE] bg-white px-2 py-1 text-[12px] font-medium text-[#6133DA] transition hover:bg-[#EBE9FE] lg:flex"
              >
                <Pencil size={10} />
                Edit
              </button>

              <p className="mt-1.5 text-[12px] font-semibold text-[#6133DA] sm:mt-2 sm:text-[13px] lg:text-[14px]">
                {profile.tagline ||
                  "Add Business Tagline"}
              </p>

              <p className="mx-auto mt-2 max-w-[600px] text-[11px] leading-[1.45] text-[#4B5563] sm:text-[12px] sm:leading-5 lg:mt-3">
                {profile.description ||
                  "Add Business Description"}
              </p>

              {/* MOBILE FACEBOOK-STYLE EDIT */}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mx-auto mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#EBE9FE] px-4 py-2 text-[11px] font-semibold text-[#241065] transition hover:bg-[#D8D6FE] lg:hidden"
              >
                <Pencil size={12} />
                Edit Profile
              </button>

            </div>

          </section>

          {/* ==================================================
              MOBILE FACEBOOK-STYLE ACTIONS
          ================================================== */}

          <section className="mt-5 lg:hidden">

            {/* PRIMARY ACTION */}

            {measurementLink && (
              <button
                type="button"
                onClick={handleMeasurementLink}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#6133DA] px-4 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#4D26B5]"
              >
                <LinkIcon size={18} />
                Measurement link
              </button>
            )}

            {/* SECONDARY ACTIONS */}

            <div
              className={`grid gap-2 ${
                measurementLink
                  ? "mt-2"
                  : ""
              } ${
                profile.portfolioUrl
                  ? "grid-cols-4"
                  : "grid-cols-3"
              }`}
            >

              {/* WHATSAPP */}

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[#EBE9FE] px-1.5 text-center transition hover:bg-[#D8D6FE]"
              >
                <FaWhatsapp
                  size={17}
                  className="text-[#25D366]"
                  aria-hidden="true"
                />

                <span className="text-[10px] font-semibold text-[#241065]">
                  WhatsApp
                </span>
              </a>

              {/* PORTFOLIO */}

              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[#EBE9FE] px-1.5 text-center transition hover:bg-[#D8D6FE]"
                >
                  <ExternalLink
                    size={17}
                    className="text-[#6133DA]"
                  />

                  <span className="text-[10px] font-semibold text-[#241065]">
                    Portfolio
                  </span>
                </a>
              )}

              {/* CONTACT */}

              <a
                href={
                  profile.phone
                    ? `tel:${profile.phone}`
                    : "#"
                }
                className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[#EBE9FE] px-1.5 text-center transition hover:bg-[#D8D6FE]"
              >
                <Phone
                  size={17}
                  className="text-[#6133DA]"
                />

                <span className="text-[10px] font-semibold text-[#241065]">
                  Contact
                </span>
              </a>

              {/* EDIT */}

              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg bg-[#EBE9FE] px-1.5 text-center transition hover:bg-[#D8D6FE]"
              >
                <Pencil
                  size={17}
                  className="text-[#6133DA]"
                />

                <span className="text-[10px] font-semibold text-[#241065]">
                  Edit
                </span>
              </button>

            </div>

          </section>

          {/* ==================================================
              DESKTOP ACTION BUTTONS
          ================================================== */}

          <section className="mt-8 hidden flex-nowrap justify-center gap-4 lg:flex">

            {/* MEASUREMENT LINK */}

            {measurementLink && (
              <button
                type="button"
                onClick={handleMeasurementLink}
                aria-label="Measurement link"
                title="Measurement link"
                className="flex min-h-[68px] w-[210px] shrink-0 items-center justify-start gap-3 rounded-xl border border-[#6133DA] bg-[#6133DA] px-4 text-left text-white transition hover:bg-[#4D26B5]"
              >
                <LinkIcon size={20} />

                <span className="text-[14px] font-bold">
                  Measurement link
                </span>
              </button>
            )}

            {/* WHATSAPP */}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-4 transition hover:bg-[#D8D6FE]"
            >
              <FaWhatsapp
                size={20}
                className="text-[#25D366]"
                aria-hidden="true"
              />

              <div>
                <p className="text-[14px] font-bold text-[#241065]">
                  Chat on WhatsApp
                </p>

                <p className="mt-1 text-[12px] text-[#4B5563]">
                  {profile.whatsappName ||
                    "Add WhatsApp Name"}
                </p>
              </div>
            </a>

            {/* PORTFOLIO */}

            <a
              href={profile.portfolioUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-4 transition hover:bg-[#D8D6FE]"
            >
              <ExternalLink
                size={20}
                className="text-[#6133DA]"
              />

              <div>
                <p className="text-[14px] font-bold text-[#241065]">
                  View Portfolio
                </p>

                <p className="mt-1 text-[12px] text-[#4B5563]">
                  {profile.portfolioUrl
                    ? "See our work"
                    : "Add Portfolio URL"}
                </p>
              </div>
            </a>

            {/* CONTACT */}

            <a
              href={
                profile.phone
                  ? `tel:${profile.phone}`
                  : "#"
              }
              className="flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-4 transition hover:bg-[#D8D6FE]"
            >
              <Phone
                size={20}
                className="text-[#6133DA]"
              />

              <div>
                <p className="text-[14px] font-bold text-[#241065]">
                  Contact Us
                </p>

                <p className="mt-1 text-[12px] text-[#4B5563]">
                  {profile.phone
                    ? "Call or email us"
                    : "Add Phone Number"}
                </p>
              </div>
            </a>

            {/* EDIT PROFILE */}

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex min-h-[68px] w-[210px] shrink-0 items-center gap-3 rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-4 text-left transition hover:bg-[#D8D6FE]"
            >
              <Pencil
                size={20}
                className="text-[#6133DA]"
              />

              <div>
                <p className="text-[14px] font-bold text-[#241065]">
                  Edit Profile
                </p>

                <p className="mt-1 text-[12px] text-[#4B5563]">
                  Update your details
                </p>
              </div>
            </button>

          </section>

          {/* ==================================================
              STATS
          ================================================== */}

          <section className="mt-4 sm:mt-5">

            <div className="grid grid-cols-3 divide-x divide-[#C4C1F2] overflow-hidden rounded-xl bg-[#D8D6FE]">

              <StatCard
                icon={<Award size={19} />}
                value={profile.happyClients}
                label="Happy Clients"
              />

              <StatCard
                icon={<Shirt size={19} />}
                value={profile.outfitsMade}
                label="Outfits Made"
              />

              <StatCard
                icon={<Clock3 size={19} />}
                value={profile.yearsExperience}
                label="Years Experience"
              />

            </div>

          </section>

          {/* ==================================================
              FEATURED WORK
          ================================================== */}

          <section className="mt-7 lg:mt-9">

            <div className="mb-3 flex items-end justify-between gap-3 lg:mb-4">

              <div>

                <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#241065] lg:text-[15px]">
                  Featured Work
                </h2>

                <p className="mt-1 text-[11px] text-[#6133DA] lg:text-[12px]">
                  Showcase products
                </p>

              </div>

              {products.length > 0 && (
                <button
                  type="button"
                  onClick={openProductModal}
                  className="flex shrink-0 items-center gap-1.5 rounded-md bg-[#6133DA] px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#4D26B5] sm:px-3 sm:py-2 sm:text-[12px]"
                >
                  <Plus size={12} />
                  Add Product
                </button>
              )}

            </div>

            {/* NO PRODUCTS */}

            {products.length === 0 ? (
              <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-[#D8D6FE] bg-[#EBE9FE] px-4 text-center sm:min-h-[180px] lg:min-h-[190px]">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D8D6FE] text-[#6133DA] lg:h-12 lg:w-12">
                  <ImageIcon size={23} />
                </div>

                <h3 className="mt-2.5 text-[13px] font-semibold text-[#241065] lg:mt-3 lg:text-[14px]">
                  No products added
                </h3>

                <p className="mt-1 text-[10px] text-[#4B5563] sm:text-[11px] lg:text-[12px]">
                  Add products to showcase to your customers
                </p>

                <button
                  type="button"
                  onClick={openProductModal}
                  className="mt-3 flex items-center gap-1.5 rounded-md bg-[#6133DA] px-3.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#4D26B5] lg:px-4 lg:py-2 lg:text-[12px]"
                >
                  <Plus size={12} />
                  Add Product
                </button>

              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4">

                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-[#D8D6FE] bg-white"
                  >

                    <div className="relative h-[135px] bg-[#EBE9FE] sm:h-[150px] lg:h-[180px]">

                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProduct(
                            product.id
                          )
                        }
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-100 shadow transition lg:opacity-0 lg:group-hover:opacity-100"
                        title="Remove product"
                      >
                        <X size={14} />
                      </button>

                    </div>

                    <div className="p-2.5 lg:p-3">

                      <p className="truncate text-[12px] font-semibold text-[#241065] lg:text-[14px]">
                        {product.name}
                      </p>

                    </div>

                  </div>
                ))}

                <button
                  type="button"
                  onClick={openProductModal}
                  className="flex min-h-[165px] flex-col items-center justify-center rounded-xl border border-dashed border-[#6133DA] bg-[#EBE9FE] text-[#6133DA] transition hover:bg-[#D8D6FE] sm:min-h-[180px] lg:min-h-[220px]"
                >
                  <Plus size={21} />

                  <span className="mt-2 text-[11px] font-semibold lg:text-[12px]">
                    Add Product
                  </span>
                </button>

              </div>
            )}

          </section>

        </div>

      </main>

      {/* =====================================================
          EDIT PROFILE DRAWER
      ====================================================== */}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#241065]/30 backdrop-blur-[2px]">

          <div className="flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-[#EBE9FE] px-4 py-4 sm:px-5 sm:py-5 lg:px-6">

              <div className="min-w-0 pr-3">

                <h2 className="text-[17px] font-bold text-[#241065] lg:text-lg">
                  Edit Profile
                </h2>

                <p className="mt-1 text-[11px] text-[#6B7280] sm:text-[12px] lg:text-[14px]">
                  Update your business information
                </p>

              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F3FF] text-[#241065] transition hover:bg-[#EBE9FE]"
              >
                <X size={17} />
              </button>

            </div>

            {/* BODY */}

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-6">

              {/* PROFILE IMAGE */}

              <div className="mb-6 flex items-center gap-3 sm:gap-4 lg:mb-7">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EBE9FE] text-center text-[9px] font-semibold text-[#6133DA] sm:h-20 sm:w-20">

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

                  <p className="text-[13px] font-semibold text-[#241065] sm:text-[14px]">
                    Business Picture
                  </p>

                  <p className="mt-1 text-[10px] text-[#6B7280] sm:text-[12px]">
                    JPG, PNG or WEBP. Maximum 20MB.
                  </p>

                  <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#6133DA] px-2.5 py-1.5 text-[10px] font-semibold text-[#6133DA] transition hover:bg-[#F4F3FF] sm:px-3 sm:py-2 sm:text-[12px]">

                    <Camera size={12} />

                    Upload Picture

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        handleImageUpload(
                          event,
                          "profileImage"
                        )
                      }
                    />

                  </label>

                </div>

              </div>

              {/* COVER IMAGE */}

              <div className="mb-6 lg:mb-7">

                <label className="mb-2 block text-[12px] font-semibold text-[#241065] sm:text-[14px]">
                  Cover Image
                </label>

                <div className="relative h-[85px] overflow-hidden rounded-lg border border-[#D8D6FE] bg-[#6133DA] sm:h-[100px]">

                  {form.coverImage ? (
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-r from-[#241065] via-[#6133DA] to-[#241065] text-[11px] text-white/70 sm:text-[14px]">
                      Add Cover Image
                    </div>
                  )}

                  <label className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-[#6133DA] shadow sm:px-2.5 sm:py-1.5 sm:text-[12px]">

                    <Camera size={11} />

                    Change

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        handleImageUpload(
                          event,
                          "coverImage"
                        )
                      }
                    />

                  </label>

                </div>

              </div>

              {/* BUSINESS INFORMATION */}

              <div>

                <h3 className="mb-3 text-[13px] font-bold text-[#6133DA] sm:text-[14px]">
                  Business Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InputField
                    label="Business Name"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="Add Business Name"
                  />

                  <InputField
                    label="Tagline"
                    name="tagline"
                    value={form.tagline}
                    onChange={handleChange}
                    placeholder="Add Business Tagline"
                  />

                  <div className="sm:col-span-2">

                    <label className="mb-1.5 block text-[12px] font-semibold text-[#241065] sm:text-[14px]">
                      Business Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Add Business Description"
                      rows={4}
                      className="w-full resize-none rounded-lg border border-[#D8D6FE] px-3 py-2.5 text-[13px] text-[#241065] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/10 sm:text-[14px]"
                    />

                  </div>

                </div>

              </div>

              {/* WHATSAPP */}

              <div className="mt-7 sm:mt-8">

                <h3 className="mb-3 text-[13px] font-bold text-[#6133DA] sm:text-[14px]">
                  WhatsApp Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InputWithIcon
                    label="WhatsApp Name"
                    name="whatsappName"
                    value={form.whatsappName}
                    onChange={handleChange}
                    icon={
                      <FaWhatsapp
                        size={15}
                        aria-hidden="true"
                      />
                    }
                    placeholder="Add WhatsApp Name"
                  />

                  <InputWithIcon
                    label="WhatsApp Number"
                    name="whatsappNumber"
                    value={form.whatsappNumber}
                    onChange={handleChange}
                    icon={<Phone size={15} />}
                    placeholder="Add WhatsApp Number"
                  />

                </div>

              </div>

              {/* CONTACT */}

              <div className="mt-7 sm:mt-8">

                <h3 className="mb-3 text-[13px] font-bold text-[#6133DA] sm:text-[14px]">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InputField
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Add Phone Number"
                  />

                  <InputWithIcon
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    icon={<Mail size={15} />}
                    placeholder="Add Email Address"
                  />

                  <div className="sm:col-span-2">

                    <InputWithIcon
                      label="Portfolio URL"
                      name="portfolioUrl"
                      value={form.portfolioUrl}
                      onChange={handleChange}
                      icon={
                        <ExternalLink size={15} />
                      }
                      placeholder="Add Portfolio URL"
                    />

                  </div>

                </div>

              </div>

              {/* STATISTICS */}

              <div className="mt-7 sm:mt-8">

                <h3 className="mb-3 text-[13px] font-bold text-[#6133DA] sm:text-[14px]">
                  Business Statistics
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <InputField
                    label="Happy Clients"
                    name="happyClients"
                    value={form.happyClients}
                    onChange={handleChange}
                    placeholder="Add Number"
                  />

                  <InputField
                    label="Outfits Made"
                    name="outfitsMade"
                    value={form.outfitsMade}
                    onChange={handleChange}
                    placeholder="Add Number"
                  />

                  <InputField
                    label="Experience"
                    name="yearsExperience"
                    value={form.yearsExperience}
                    onChange={handleChange}
                    placeholder="Add Experience"
                  />

                </div>

              </div>

            </div>

            {/* DRAWER FOOTER */}

            <div className="flex items-center justify-end gap-2 border-t border-[#EBE9FE] px-4 py-3 sm:px-5 sm:py-4 lg:px-6">

              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg bg-[#EBE9FE] px-3 py-2.5 text-[12px] font-semibold text-[#241065] transition hover:bg-[#D8D6FE] sm:flex-none sm:px-4 sm:text-[14px]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#6133DA] px-3 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#4D26B5] sm:flex-none sm:px-4 sm:text-[14px]"
              >
                <Check size={14} />
                Save Changes
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          ADD PRODUCT MODAL
      ====================================================== */}

      {showProductModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#241065]/40 px-3 py-4 backdrop-blur-sm sm:px-4">

          <div className="max-h-[95vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-[#EBE9FE] px-4 py-4 sm:px-6 sm:py-5">

              <div className="pr-3">

                <h2 className="text-[17px] font-bold text-[#241065] sm:text-lg">
                  Add Product
                </h2>

                <p className="mt-1 text-[11px] text-[#6B7280] sm:text-[14px]">
                  Add a picture of your work to your portfolio
                </p>

              </div>

              <button
                type="button"
                onClick={closeProductModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F3FF] text-[#241065] hover:bg-[#EBE9FE]"
              >
                <X size={16} />
              </button>

            </div>

            {/* BODY */}

            <div className="p-4 sm:p-6">

              {/* IMAGE PREVIEW */}

              <div className="relative mb-4 flex h-[180px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#D8D6FE] bg-[#F4F3FF] sm:mb-5 sm:h-[210px] lg:h-[240px]">

                {productImage ? (
                  <img
                    src={productImage}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="px-3 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBE9FE] text-[#6133DA] sm:h-14 sm:w-14">
                      <ImageIcon size={25} />
                    </div>

                    <p className="mt-2.5 text-[13px] font-semibold text-[#241065] sm:mt-3 sm:text-[14px]">
                      Add product picture
                    </p>

                    <p className="mt-1 text-[11px] text-[#6B7280] sm:text-[12px]">
                      Choose a picture or use your camera
                    </p>

                  </div>
                )}

              </div>

              {/* PICTURE OPTIONS */}

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

                <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#6133DA] bg-white py-2.5 text-[11px] font-semibold text-[#6133DA] transition hover:bg-[#F4F3FF] sm:gap-2 sm:py-3 sm:text-[14px]">

                  <ImageIcon size={15} />

                  Choose Picture

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={
                      handleProductImageUpload
                    }
                  />

                </label>

                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#6133DA] py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#4D26B5] sm:gap-2 sm:py-3 sm:text-[14px]"
                >

                  <Camera size={15} />

                  Take Picture

                </button>

              </div>

              {/* PRODUCT NAME */}

              <div className="mt-4 sm:mt-5">

                <label className="mb-1.5 block text-[12px] font-semibold text-[#241065] sm:text-[14px]">
                  Product Name
                </label>

                <input
                  value={productName}
                  onChange={(event) =>
                    setProductName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Senator Outfit"
                  className="w-full rounded-lg border border-[#D8D6FE] px-3 py-2.5 text-[13px] text-[#241065] outline-none placeholder:text-[#9CA3AF] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/10 sm:py-3 sm:text-[14px]"
                />

              </div>

              {/* ADD */}

              <button
                type="button"
                onClick={handleAddProduct}
                disabled={
                  !productImage ||
                  !productName.trim()
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#6133DA] py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#4D26B5] disabled:cursor-not-allowed disabled:opacity-40 sm:mt-5 sm:py-3 sm:text-[14px]"
              >

                <Plus size={14} />

                Add to Featured Work

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          LIVE CAMERA
      ====================================================== */}

      {cameraOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-2 py-3 sm:px-4">

          <div className="w-full max-w-[650px] overflow-hidden rounded-xl bg-white shadow-2xl sm:rounded-2xl">

            {/* CAMERA HEADER */}

            <div className="flex items-center justify-between bg-[#241065] px-4 py-3 text-white sm:px-5 sm:py-4">

              <div className="min-w-0 pr-3">

                <h2 className="text-[13px] font-bold sm:text-sm">
                  Take Product Picture
                </h2>

                <p className="mt-1 truncate text-[10px] text-white/60 sm:text-[12px]">
                  Position your outfit inside the frame
                </p>

              </div>

              <button
                type="button"
                onClick={closeCamera}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
              >
                <X size={17} />
              </button>

            </div>

            {/* CAMERA VIEW */}

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

            {/* CAMERA CONTROLS */}

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
                className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#6133DA] text-white shadow-lg transition hover:scale-105"
                title="Take picture"
              >
                <Camera size={23} />
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// ======================================================
// INPUT FIELD
// ======================================================

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[12px] font-semibold text-[#241065] sm:text-[14px]">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#D8D6FE] px-3 py-2.5 text-[13px] text-[#241065] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/10 sm:text-[14px]"
      />

    </div>
  );
}

// ======================================================
// INPUT WITH ICON
// ======================================================

function InputWithIcon({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[12px] font-semibold text-[#241065] sm:text-[14px]">
        {label}
      </label>

      <div className="relative">

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6133DA]">
          {icon}
        </span>

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#D8D6FE] py-2.5 pl-9 pr-3 text-[13px] text-[#241065] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#6133DA] focus:ring-2 focus:ring-[#6133DA]/10 sm:text-[14px]"
        />

      </div>

    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <div className="flex h-[68px] min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-center sm:h-[72px] sm:flex-row sm:gap-2 sm:px-2 sm:text-left lg:gap-3">

      <div className="shrink-0 text-[#6133DA]">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="truncate text-[10px] font-bold text-[#241065] sm:text-[12px] lg:text-[14px]">
          {value || "Add Information"}
        </p>

        <p className="truncate text-[8px] text-[#4B5563] sm:text-[10px] lg:text-[12px]">
          {label}
        </p>

      </div>

    </div>
  );
}