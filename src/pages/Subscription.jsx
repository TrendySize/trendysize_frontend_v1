import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Share2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getProfile, publicProfileLinkFor } from "../services/api";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    amount: 5000,
    duration: 30,
    description: "For individual tailors and small fashion businesses.",
    features: [
      "Generate measurement links",
      "Customer measurement collection",
      "One-time measurement links",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    amount: 10000,
    duration: 30,
    description: "For growing fashion businesses.",
    features: [
      "Generate measurement links",
      "Customer measurement collection",
      "One-time measurement links",
      "Unlimited link generation",
    ],
  },
  {
    id: "business",
    name: "Business",
    amount: 20000,
    duration: 30,
    description: "For established fashion businesses and teams.",
    features: [
      "Generate measurement links",
      "Customer measurement collection",
      "One-time measurement links",
      "Unlimited link generation",
      "Business-level features",
    ],
  },
];

const SUBSCRIPTION_STORAGE_KEY = "trendySize_subscription";
const MEASUREMENT_LINK_KEY = "trendySize_active_measurement_link";

function getSubscription() {
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const subscription = JSON.parse(stored);

    if (!subscription?.expiresAt) {
      localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
      return null;
    }

    const isActive = Date.now() < subscription.expiresAt;

    if (!isActive) {
      localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
      localStorage.removeItem(MEASUREMENT_LINK_KEY);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error("Unable to read subscription:", error);
    return null;
  }
}

function buildSubscription(plan) {
  const now = Date.now();

  return {
    id: `${plan.id}-${now}`,
    planId: plan.id,
    planName: plan.name,
    amount: plan.amount,
    startedAt: now,
    expiresAt: now + plan.duration * 24 * 60 * 60 * 1000,
    active: true,
  };
}

function createMeasurementLink(username) {
  // The backend only exposes a public WhatsApp redirect for a vendor
  // (GET /api/public/v/{username} — guide §6). Measurement links that carry a
  // submission token are generated per customer from the Customers page.
  const link = publicProfileLinkFor(username);

  const measurementLink = {
    token: username,
    link,
    used: false,
    createdAt: Date.now(),
  };

  localStorage.setItem(
    MEASUREMENT_LINK_KEY,
    JSON.stringify(measurementLink)
  );

  return measurementLink;
}

export default function Subscription() {
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  /*
   * ============================================================
   * LOAD SUBSCRIPTION
   * ============================================================
   */
  useEffect(() => {
    const loadSubscription = () => {
      const currentSubscription = getSubscription();

      setSubscription(currentSubscription);

      try {
        const storedLink = localStorage.getItem(
          MEASUREMENT_LINK_KEY
        );

        if (storedLink) {
          const parsedLink = JSON.parse(storedLink);

          if (parsedLink?.used) {
            localStorage.removeItem(MEASUREMENT_LINK_KEY);
            setGeneratedLink(null);
          } else {
            setGeneratedLink(parsedLink);
          }
        } else {
          setGeneratedLink(null);
        }
      } catch (error) {
        console.error(
          "Unable to read measurement link:",
          error
        );
      }
    };

    loadSubscription();

    /*
     * Check the subscription periodically so that
     * it automatically disappears when it expires.
     */
    const subscriptionTimer = setInterval(() => {
      const currentSubscription = getSubscription();

      setSubscription(currentSubscription);

      if (!currentSubscription) {
        setGeneratedLink(null);
      }
    }, 1000);

    return () => {
      clearInterval(subscriptionTimer);
    };
  }, []);


  /*
   * ============================================================
   * SUBSCRIBE / SWITCH PLAN
   * ============================================================
   */
  const handleSubscribe = (plan) => {
    const newSubscription = buildSubscription(plan);

    localStorage.setItem(
      SUBSCRIPTION_STORAGE_KEY,
      JSON.stringify(newSubscription)
    );

    setSubscription(newSubscription);
    setSelectedPlan(plan);

    localStorage.removeItem(MEASUREMENT_LINK_KEY);
    setGeneratedLink(null);
  };


  /*
   * ============================================================
   * CANCEL SUBSCRIPTION
   * ============================================================
   */
  const handleCancelSubscription = () => {
    setConfirmCancel(true);
  };

  const confirmCancelSubscription = () => {
    setConfirmCancel(false);

    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    localStorage.removeItem(MEASUREMENT_LINK_KEY);

    setSubscription(null);
    setSelectedPlan(null);
    setGeneratedLink(null);
    setToast({ message: "Your subscription was cancelled.", tone: "success" });
  };


  /*
   * ============================================================
   * GENERATE MEASUREMENT LINK
   * ============================================================
   */
  const handleGenerateLink = async () => {
    const currentSubscription = getSubscription();

    if (!currentSubscription) {
      setSubscription(null);
      navigate("/subscription");
      return;
    }

    let username = "";
    try {
      const profile = await getProfile();
      username = profile?.username || "";
    } catch (error) {
      console.error("Could not load vendor username:", error);
    }

    if (!username) {
      setToast({
        message: "We could not find your public link. Please try again later.",
        tone: "error",
      });
      return;
    }

    const newLink = createMeasurementLink(username);

    setGeneratedLink(newLink);

    navigate("/dashboard", {
      state: {
        measurementLinkGenerated: true,
      },
    });
  };


  /*
   * ============================================================
   * COPY LINK
   * ============================================================
   */
  const handleCopy = async () => {
    if (!generatedLink?.link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedLink.link
      );

      setCopied(true);
      setToast({ message: "Link copied to clipboard.", tone: "success" });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy link:", error);
      setToast({ message: "Couldn't copy the link. Please copy it manually.", tone: "error" });
    }
  };


  /*
   * ============================================================
   * SHARE LINK
   * ============================================================
   */
  const handleShare = async () => {
    if (!generatedLink?.link) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Measurement Link",
          text: "Use this link to submit your measurements.",
          url: generatedLink.link,
        });
      } else {
        await navigator.clipboard.writeText(
          generatedLink.link
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(
          "Unable to share measurement link:",
          error
        );
        setToast({ message: "Couldn't share the link. Please try again.", tone: "error" });
      }
    }
  };


  /*
   * ============================================================
   * OPEN LINK
   * ============================================================
   */
  const handleOpenLink = () => {
    if (!generatedLink?.link) {
      return;
    }

    const opened = window.open(
      generatedLink.link,
      "_blank",
      "noopener,noreferrer"
    );

    if (!opened) {
      setToast({
        message: "Your browser blocked the pop-up. Please allow pop-ups and try again.",
        tone: "error",
      });
    }
  };


  /*
   * ============================================================
   * BACK TO DASHBOARD
   * ============================================================
   */
  const handleBack = () => {
    navigate("/dashboard");
  };


  const activePlan = subscription
    ? SUBSCRIPTION_PLANS.find(
        (plan) => plan.id === subscription.planId
      )
    : null;


  /*
   * ============================================================
   * FORMAT EXPIRY DATE
   * ============================================================
   */
  const expiryDate = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : null;


  return (
    <div className="relative z-10 min-h-screen bg-transparent px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

      <div className="mx-auto max-w-[1180px]">

        {/* =====================================================
            TOP NAVIGATION
        ===================================================== */}
        <div className="mb-10 flex items-center justify-between lg:mb-12">

          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-[#241065] transition hover:opacity-70"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

        </div>


        {/* =====================================================
            PAGE HEADER
        ===================================================== */}
        <div className="mb-10 lg:mb-12">

          <h1 className="text-3xl font-bold leading-tight text-[#241065] sm:text-3xl lg:text-4xl">
            Subscription Plans
          </h1>

          <p className="mt-2 max-w-[620px] text-xs leading-5 text-[#6B7280] sm:text-sm">
            Choose a plan that fits your fashion business and manage
            your measurement links from one place. Every new account
            starts with 10 free measurement links.
          </p>

        </div>


        {/* =====================================================
            ACTIVE SUBSCRIPTION
        ===================================================== */}
        {subscription && (
          <div className="mb-10 rounded-[18px] border border-[#D8D6FE] bg-white p-6  lg:p-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* CURRENT PLAN INFO */}
              <div className="flex items-center gap-3">

                <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#EBE9FE]">
                  <Check
                    size={19}
                    strokeWidth={2}
                    className="text-[#6133DA]"
                  />
                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-sm font-semibold text-[#241065]">
                      {subscription.planName}
                    </span>

                    <span className="rounded-full bg-[#EBE9FE] px-2 py-0.5 text-xs font-semibold text-[#6133DA]">
                      Active
                    </span>

                  </div>

                  {/* PRICE */}
                  <p className="mt-1 text-xs text-[#6B7280]">
                    ₦{Number(subscription.amount).toLocaleString()} /{" "}
                    {subscription.active
                      ? "30 days"
                      : "Subscription"}
                  </p>

                  {/* =================================================
                      EXPIRY
                  ================================================= */}
                  <p className="mt-1 text-xs font-medium text-[#6133DA]">
                    Expires on:{" "}
                    <span className="font-semibold">
                      {expiryDate}
                    </span>
                  </p>

                </div>

              </div>


              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={handleGenerateLink}
                  className="flex h-[36px] items-center justify-center gap-1.5 rounded-[8px] bg-[#6133DA] px-4 text-xs font-semibold text-white transition hover:bg-[#4f27b8]"
                >
                  <LinkIcon size={15} />
                  Generate Link
                </button>

                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  className="flex h-[36px] items-center justify-center gap-1.5 rounded-[8px] border border-[#F0CACA] bg-white px-4 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
                >
                  <X size={15} />
                  Cancel
                </button>

              </div>

            </div>
          </div>
        )}


        {/* =====================================================
            GENERATED LINK
        ===================================================== */}
        {generatedLink && (
          <div className="mb-10 rounded-[18px] border border-[#E5E7EB] bg-white p-6  lg:p-7">

            <div className="flex items-center gap-3">

              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-[#EBE9FE]">
                <LinkIcon
                  size={18}
                  className="text-[#6133DA]"
                />
              </div>

              <div className="min-w-0">

                <h2 className="text-sm font-semibold text-[#241065]">
                  Measurement Link
                </h2>

                <p className="mt-0.5 text-xs text-[#6B7280]">
                  One-time link for collecting customer measurements.
                </p>

              </div>

            </div>


            <div className="mt-3 flex flex-col gap-2 rounded-[9px] bg-[#F4F3FF] p-2.5 sm:flex-row sm:items-center">

              <div className="min-w-0 flex-1 px-1">
                <p className="truncate text-xs text-[#4B5563]">
                  {generatedLink.link}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-[32px] items-center justify-center gap-1.5 rounded-[7px] bg-white px-3 text-xs font-semibold text-[#241065]  transition hover:bg-[#EBE9FE]"
                >
                  {copied ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}

                  {copied ? "Copied" : "Copy"}
                </button>


                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-[32px] items-center justify-center gap-1.5 rounded-[7px] bg-[#6133DA] px-3 text-xs font-semibold text-white transition hover:bg-[#4f27b8]"
                >
                  <Share2 size={14} />
                  Share
                </button>


                <button
                  type="button"
                  onClick={handleOpenLink}
                  className="flex h-[32px] items-center justify-center gap-1.5 rounded-[7px] border border-[#6133DA] bg-white px-3 text-xs font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
                >
                  <ExternalLink size={14} />
                  Open
                </button>

              </div>
            </div>
          </div>
        )}


        {/* =====================================================
            PLAN HEADER
        ===================================================== */}
        <div className="mb-6 flex items-end justify-between lg:mb-7">

          <div>

            <h2 className="text-base font-bold text-[#241065] sm:text-lg">
              {subscription
                ? "Change your plan"
                : "Choose a plan"}
            </h2>

            <p className="mt-1.5 text-xs text-[#6B7280] sm:text-xs">
              {subscription
                ? "Switch to another plan whenever you need."
                : "New accounts get 10 free measurement links. Choose a plan for unlimited links."}
            </p>

          </div>

        </div>


        {/* =====================================================
            SUBSCRIPTION PLANS
        ===================================================== */}
        <div data-tour="subscription-plans" className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">

          {SUBSCRIPTION_PLANS.map((plan) => {

            const isCurrentPlan =
              subscription?.planId === plan.id;

            const isSelected =
              selectedPlan?.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative flex min-h-[400px] flex-col rounded-[18px] bg-white p-6  transition sm:p-7 ${
                  isCurrentPlan
                    ? "border-2 border-[#6133DA]"
                    : isSelected
                      ? "border-2 border-[#BCB5FD]"
                      : "border border-[#E8E6F2]"
                }`}
              >

                {isCurrentPlan && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#EBE9FE] px-2.5 py-1 text-xs font-bold text-[#6133DA]">
                    CURRENT PLAN
                  </span>
                )}


                <h3 className="text-base font-bold text-[#241065]">
                  {plan.name}
                </h3>


                <p className="mt-2 min-h-[38px] max-w-[220px] text-xs leading-[15px] text-[#6B7280]">
                  {plan.description}
                </p>


                <div className="mt-5 flex items-baseline">

                  <span className="text-3xl font-bold leading-none text-[#241065]">
                    ₦{plan.amount.toLocaleString()}
                  </span>

                  <span className="ml-1.5 text-xs text-[#6B7280]">
                    / {plan.duration} days
                  </span>

                </div>


                <div className="my-4 h-px bg-[#EEEAF8]" />


                <div className="flex-1 space-y-2.5">

                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2"
                    >

                      <div className="mt-[1px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#EBE9FE]">
                        <Check
                          size={10}
                          strokeWidth={2.5}
                          className="text-[#6133DA]"
                        />
                      </div>

                      <span className="text-xs leading-[15px] text-[#4B5563]">
                        {feature}
                      </span>

                    </div>
                  ))}

                </div>


                <div className="mt-5">

                  {isCurrentPlan ? (
                    <button
                      type="button"
                      disabled
                      className="h-[37px] w-full cursor-not-allowed rounded-[8px] bg-[#EBE9FE] text-xs font-semibold text-[#6133DA]"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan)}
                      className="h-[37px] w-full rounded-[8px] bg-[#6133DA] text-xs font-semibold text-white transition hover:bg-[#4f27b8]"
                    >
                      {subscription
                        ? "Switch to this plan"
                        : "Subscribe"}
                    </button>
                  )}

                </div>

              </div>
            );
          })}

        </div>


        {/* =====================================================
            GENERATE LINK BOTTOM SECTION
        ===================================================== */}
        {subscription && !generatedLink && (
          <div className="mt-8 rounded-[18px] border border-[#E5E7EB] bg-white px-6 py-7 text-center  sm:px-7">

            <div className="mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-[#EBE9FE]">
              <LinkIcon
                size={18}
                className="text-[#6133DA]"
              />
            </div>

            <h2 className="mt-2.5 text-sm font-bold text-[#241065]">
              Ready to generate a measurement link?
            </h2>

            <p className="mx-auto mt-1 max-w-[430px] text-xs leading-4 text-[#6B7280]">
              Your {activePlan?.name || subscription.planName} plan is
              active. Generate a link whenever you need one.
            </p>

            <button
              type="button"
              onClick={handleGenerateLink}
              className="mt-3 inline-flex h-[35px] items-center gap-1.5 rounded-[8px] bg-[#6133DA] px-4 text-xs font-semibold text-white transition hover:bg-[#4f27b8]"
            >
              <LinkIcon size={14} />
              Generate Link
            </button>

          </div>
        )}

      </div>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel subscription"
        description="Are you sure you want to cancel your subscription? You can resubscribe at any time."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep it"
        tone="danger"
        onConfirm={confirmCancelSubscription}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}