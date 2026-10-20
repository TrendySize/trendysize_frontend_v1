import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  Link2,
  Pencil,
  PlayCircle,
  Plus,
  Ruler,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";

import DashboardSidebar from "../components/DashboardSidebar";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import GenerateLinkModal from "../components/GenerateLinkModal";
import AddCustomerModal from "../components/AddCustomerModal";
import drawerLogo from "../assets/images/nav.png";
import {
  getProfile,
  getCustomers,
  getMeasurements,
  deleteCustomer as deleteCustomerRequest,
} from "../services/api";

const ITEMS_PER_PAGE = 5;

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  const [user, setUser] = useState(null);

  const [avatarFailed, setAvatarFailed] = useState(false);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState(null); // { message, tone }
  const [pendingDelete, setPendingDelete] = useState(null);

  // Per-customer measurement link generation (guide §5). The shared
  // GenerateLinkModal owns the order-reference field, loading, result and any
  // backend error (subscription inactive/expired, daily cap, unknown customer).
  const [linkTarget, setLinkTarget] = useState(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  // Add customer (POST /api/customers — upsert by phone number).
  const [addModalOpen, setAddModalOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD DASHBOARD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);

        // Real backend resources (guide §3.5, §4.2, §5.1).
        const [profile, customers, measurements] = await Promise.all([
          getProfile().catch(() => null),
          getCustomers(),
          getMeasurements(),
        ]);

        if (profile) {
          setUser(profile);
          localStorage.setItem("trendySize_user", JSON.stringify(profile));
        }

        setCustomers(Array.isArray(customers) ? customers : []);
        setMeasurements(Array.isArray(measurements) ? measurements : []);
      } catch (error) {
        console.error("Unable to load customers:", error);
        setCustomers([]);
        setMeasurements([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOGGED-IN USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadStoredUser = () => {
      const possibleKeys = [
        "trendySize_user",
        "auth_user",
        "user",
      ];

      for (const key of possibleKeys) {
        const savedUser = localStorage.getItem(key);

        if (!savedUser) continue;

        try {
          const parsedUser = JSON.parse(savedUser);

          if (parsedUser && typeof parsedUser === "object") {
            setUser(parsedUser);
            return;
          }
        } catch (error) {
          console.error(
            `Unable to read ${key}:`,
            error
          );
        }
      }

      setUser(null);
    };

    loadStoredUser();

    const handleStorageChange = () => {
      loadStoredUser();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const userName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "";

  const userInitial =
    userName.trim().charAt(0).toUpperCase() || "";

  const profileImage =
    user?.profileImageUrl ||
    user?.profileImage ||
    user?.avatarUrl ||
    "";

  /*
  |--------------------------------------------------------------------------
  | GET CUSTOMER NAME
  |--------------------------------------------------------------------------
  */

  const getCustomerName = (customer) => {
    return (
      customer?.name ||
      customer?.full_name ||
      customer?.fullName ||
      "Unnamed Customer"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | GET CUSTOMER PHONE
  |--------------------------------------------------------------------------
  */

  const getCustomerPhone = (customer) => {
    return (
      customer?.phone ||
      customer?.phone_number ||
      customer?.phoneNumber ||
      customer?.contact ||
      "—"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | GET CUSTOMER MEASUREMENTS
  |--------------------------------------------------------------------------
  */

  const getCustomerMeasurements = useCallback((customer) => {
    const nestedMeasurements = Array.isArray(
      customer?.measurements
    )
      ? customer.measurements
      : [];

    const externalMeasurements = measurements.filter(
      (measurement) => {
        const measurementCustomerId =
          measurement?.customer_id ??
          measurement?.client_id ??
          measurement?.customerId ??
          measurement?.clientId;

        return (
          String(measurementCustomerId) ===
          String(customer?.id)
        );
      }
    );

    return [
      ...nestedMeasurements,
      ...externalMeasurements,
    ];
  }, [measurements]);

  /*
  |--------------------------------------------------------------------------
  | GET LATEST MEASUREMENT
  |--------------------------------------------------------------------------
  */

  const getLatestMeasurement = useCallback((customer) => {
    const customerMeasurements =
      getCustomerMeasurements(customer);

    if (!customerMeasurements.length) {
      return null;
    }

    const sorted = [...customerMeasurements].sort(
      (a, b) => {
        const dateA = new Date(
          a?.created_at ||
            a?.createdAt ||
            a?.submitted_at ||
            a?.submittedAt ||
            0
        );

        const dateB = new Date(
          b?.created_at ||
            b?.createdAt ||
            b?.submitted_at ||
            b?.submittedAt ||
            0
        );

        return dateB - dateA;
      }
    );

    return sorted[0];
  }, [getCustomerMeasurements]);

  /*
  |--------------------------------------------------------------------------
  | PREPARE CUSTOMER DATA
  |--------------------------------------------------------------------------
  */

  const processedCustomers = useMemo(() => {
    return customers.map((customer) => {
      const customerMeasurements =
        getCustomerMeasurements(customer);

      const latestMeasurement =
        getLatestMeasurement(customer);

      return {
        ...customer,

        measurementCount:
          customerMeasurements.length,

        lastMeasurement:
          latestMeasurement?.created_at ||
          latestMeasurement?.createdAt ||
          latestMeasurement?.submitted_at ||
          latestMeasurement?.submittedAt ||
          customer?.last_measurement_at ||
          customer?.lastMeasurementAt ||
          null,
      };
    });
  }, [customers, getCustomerMeasurements, getLatestMeasurement]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL CUSTOMERS
  |--------------------------------------------------------------------------
  */

  const totalCustomers = processedCustomers.length;

  /*
  |--------------------------------------------------------------------------
  | TOTAL MEASUREMENTS
  |--------------------------------------------------------------------------
  */

  const totalMeasurements = processedCustomers.reduce(
    (total, customer) => {
      return total + customer.measurementCount;
    },
    0
  );

  /*
  |--------------------------------------------------------------------------
  | NEW THIS MONTH
  |--------------------------------------------------------------------------
  */

  const newThisMonth = processedCustomers.filter(
    (customer) => {
      const createdDate =
        customer?.created_at ||
        customer?.createdAt;

      if (!createdDate) {
        return false;
      }

      const date = new Date(createdDate);

      const now = new Date();

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
  ).length;

  /*
  |--------------------------------------------------------------------------
  | SEARCH + SORT
  |--------------------------------------------------------------------------
  */

  const filteredCustomers = useMemo(() => {
    let result = [...processedCustomers];

    const search = searchTerm
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter((customer) => {
        const name = getCustomerName(
          customer
        ).toLowerCase();

        const phone =
          getCustomerPhone(customer).toLowerCase();

        const email = String(
          customer?.email || ""
        ).toLowerCase();

        return (
          name.includes(search) ||
          phone.includes(search) ||
          email.includes(search)
        );
      });
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(
            b?.created_at ||
              b?.createdAt ||
              0
          ) -
          new Date(
            a?.created_at ||
              a?.createdAt ||
              0
          )
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(
            a?.created_at ||
              a?.createdAt ||
              0
          ) -
          new Date(
            b?.created_at ||
              b?.createdAt ||
              0
          )
        );
      }

      if (sortBy === "name") {
        return getCustomerName(a).localeCompare(
          getCustomerName(b)
        );
      }

      if (sortBy === "measurements") {
        return (
          b.measurementCount -
          a.measurementCount
        );
      }

      return 0;
    });

    return result;
  }, [
    processedCustomers,
    searchTerm,
    sortBy,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedCustomers =
    filteredCustomers.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER INITIALS
  |--------------------------------------------------------------------------
  */

  const getInitials = (name) => {
    if (!name) {
      return "CU";
    }

    const parts = name
      .trim()
      .split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW CUSTOMER
  |--------------------------------------------------------------------------
  */

  const viewCustomer = (customer) => {
    if (!customer?.id) {
      console.error(
        "Customer ID is missing:",
        customer
      );

      return;
    }

    navigate(
      `/customers/${customer.id}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | EDIT CUSTOMER
  |--------------------------------------------------------------------------
  */

  const editCustomer = (customer) => {
    if (!customer?.id) {
      return;
    }

    navigate(
      `/customers/${customer.id}?edit=true`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE CUSTOMER
  |--------------------------------------------------------------------------
  */

  const deleteCustomer = (customer) => {
    if (!customer?.id) {
      return;
    }

    setPendingDelete(customer);
  };

  const confirmDeleteCustomer = async () => {
    const customer = pendingDelete;

    if (!customer?.id) {
      return;
    }

    setPendingDelete(null);

    try {
      await deleteCustomerRequest(customer.id);

      setCustomers((previous) =>
        previous.filter(
          (item) =>
            item.id !== customer.id
        )
      );
      setToast({ message: `${getCustomerName(customer)} was deleted.`, tone: "success" });
    } catch (error) {
      console.error(
        "Delete customer error:",
        error
      );

      setToast({
        message: error?.message || "Unable to delete customer.",
        tone: "error",
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ADD CUSTOMER (upsert by phone number)
  |--------------------------------------------------------------------------
  */

  const handleCustomerCreated = (customer) => {
    if (!customer?.id) return;

    // upsert returns the existing record for a known phone number, so dedupe.
    setCustomers((previous) => {
      const exists = previous.some((item) => item.id === customer.id);
      return exists ? previous : [customer, ...previous];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | GENERATE MEASUREMENT LINK (per customer)
  |--------------------------------------------------------------------------
  |
  | Calls POST /api/measurements/generate-link for one customer via the shared
  | GenerateLinkModal. The result is a single-use, 24h token/link the vendor
  | sends to that customer (guide §5). This is distinct from the vendor's
  | permanent WhatsApp business link.
  |
  */

  const openLinkModal = (customer) => {
    if (!customer?.id) return;

    setLinkTarget(customer);
    setLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    setLinkModalOpen(false);
    setLinkTarget(null);
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative min-h-screen bg-transparent text-[var(--tk-ink)]">

      {/* SIDEBAR */}

      <DashboardSidebar activeLabel="Customers" />

      {/* MAIN */}

      <main className="relative z-10 min-h-screen lg:ml-[240px]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="flex h-[88px] items-center justify-between px-4 sm:px-6 lg:h-[56px] lg:justify-end lg:px-8">

          <button
            type="button"
            aria-label="Go to dashboard"
            onClick={() =>
              navigate("/dashboard")
            }
            className="hidden items-center gap-0 max-lg:flex"
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

          <div className="flex items-center gap-3 max-lg:gap-1">

            <button
              type="button"
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6133DA] transition hover:bg-[#EBE9FE]"
            >
              <Bell
                size={18}
                strokeWidth={1.8}
              />
            </button>

            {userName ? (
              <RouterLink
                to="/profile"
                aria-label="Open profile and settings"
                title="Profile & Settings"
                className="flex items-center gap-3 rounded-full pr-1 transition-colors hover:bg-[#EBE9FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/50 max-lg:gap-1 max-lg:pr-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#241065] text-[13px] font-bold text-[#9B8CF9]">
                  {profileImage && !avatarFailed ? (
                    <img
                      src={profileImage}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    userInitial
                  )}
                </div>

                <span className="max-w-[120px] truncate text-[13px] font-medium text-[#241065] max-lg:hidden">
                  {userName}
                </span>

                <ChevronDown
                  size={15}
                  className="text-[#8179AD] max-lg:hidden"
                />
              </RouterLink>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    "/signin";
                }}
                className="text-[13px] font-semibold text-[#6133DA] transition hover:text-[#4D26B5] hover:underline"
              >
                Sign in
              </button>
            )}



          </div>
        </header>

        {/* CONTENT */}

        <section className="px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 lg:px-7 lg:pb-14 lg:pt-5">
          <div className="mx-auto w-full max-w-[1180px]">

          {/* =====================================================
              TITLE
          ===================================================== */}

          <div className="mb-6 flex items-start justify-between gap-3">

            <div>
              <h1 className="text-[22px] font-bold text-[#241065]">
                Customers
              </h1>

              <p className="mt-1 text-[12px] text-[#8179AD]">
                Manage your customer measurement
                records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-[9px] bg-[#6133DA] px-3.5 text-[12px] font-semibold text-white transition hover:bg-[#5227c2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/50 sm:px-4"
            >
              <Plus size={15} />
              <span className="max-[380px]:hidden">Add customer</span>
              <span className="hidden max-[380px]:inline">Add</span>
            </button>

          </div>

          {/* =====================================================
              DESKTOP SUMMARY CARDS
              DESKTOP ONLY — ORIGINAL DESIGN
          ===================================================== */}

          <div className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-3">

            {/* TOTAL CUSTOMERS */}

            <div className="flex min-h-[100px] items-center gap-4 rounded-[12px] bg-[#EBE9FE] px-5">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D8D6FE] text-[#6133DA]">
                <UsersRound size={17} />
              </div>

              <div className="flex flex-1 flex-col justify-center gap-[4px] overflow-hidden">

                <p className="overflow-hidden text-ellipsis text-[11px] font-medium text-[#8179AD]">
                  Total Customers
                </p>

                <p className="text-[20px] font-bold leading-none text-[#241065]">
                  {totalCustomers}
                </p>

                <p className="text-[10px] text-[#958DBA]">
                  All Time
                </p>

              </div>

            </div>

            {/* MEASUREMENTS */}

            <div className="flex min-h-[100px] items-center gap-4 rounded-[12px] bg-[#EBE9FE] px-5">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9F3E4] text-[#3BA968]">
                <Ruler size={17} />
              </div>

              <div className="flex flex-1 flex-col justify-center gap-[4px] overflow-hidden">

                <p className="overflow-hidden text-ellipsis text-[11px] font-medium text-[#8179AD]">
                  Measurements collected
                </p>

                <p className="text-[20px] font-bold leading-none text-[#241065]">
                  {totalMeasurements}
                </p>

                <p className="text-[10px] text-[#958DBA]">
                  Across all customers
                </p>

              </div>

            </div>

            {/* NEW THIS MONTH */}

            <div className="flex min-h-[100px] items-center gap-4 rounded-[12px] bg-[#EBE9FE] px-5">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D8D6FE] text-[#6133DA]">
                <ClipboardList size={17} />
              </div>

              <div>

                <p className="text-[11px] font-medium text-[#8179AD]">
                  New This Month
                </p>

                <p className="mt-1 text-[20px] font-bold text-[#241065]">
                  {newThisMonth}
                </p>

                <p className="text-[10px] text-[#958DBA]">
                  From this month
                </p>

              </div>

            </div>

          </div>

          {/* =====================================================
              MOBILE SUMMARY
              MOBILE ONLY
          ===================================================== */}

          <div className="flex flex-col gap-2 md:hidden">

            {/* CUSTOMERS */}

            <div className="tk-tile flex min-h-[64px] min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5">

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6133DA]">
                  <UsersRound size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#241065]">
                    Total Customers
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8179AD]">
                    All time
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2 text-right">
                <p className="text-[20px] font-bold leading-none text-[#241065]">
                  {totalCustomers}
                </p>
              </div>

            </div>

            {/* MEASUREMENTS */}

            <div className="tk-tile flex min-h-[64px] min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5">

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F7EC] text-[#3BA968]">
                  <Ruler size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#241065]">
                    Measurements
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8179AD]">
                    Across all customers
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2 text-right">
                <p className="text-[20px] font-bold leading-none text-[#241065]">
                  {totalMeasurements}
                </p>
              </div>

            </div>

            {/* NEW */}

            <div className="tk-tile flex min-h-[64px] min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5">

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6133DA]">
                  <ClipboardList size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#241065]">
                    New this month
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8179AD]">
                    New customers
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2 text-right">
                <p className="text-[20px] font-bold leading-none text-[#241065]">
                  {newThisMonth}
                </p>
              </div>

            </div>

          </div>

          {/* =====================================================
              DESKTOP SEARCH + SORT
              DESKTOP ONLY
          ===================================================== */}

          <div className="mt-4 hidden flex-col gap-3 md:flex md:flex-row md:items-center md:justify-between">

            {/* SEARCH */}

            <div className="flex h-10 w-full items-center gap-2 rounded-[9px] border border-[#E0DCF5] bg-white px-3 md:max-w-[350px]">

              <Search
                size={15}
                className="shrink-0 text-[#958DBA]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
                placeholder="Search by name or phone number..."
                className="w-full bg-transparent text-[12px] text-[#241065] outline-none placeholder:text-[#AAA4C1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
              />

            </div>

            {/* SORT */}

            <div className="relative">

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
                className="h-10 min-w-[130px] appearance-none rounded-[9px] border border-[#E0DCF5] bg-white pl-9 pr-8 text-[12px] font-medium text-[#5E5782] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>

                <option value="name">
                  Name
                </option>

                <option value="measurements">
                  Most measurements
                </option>
              </select>

              <Filter
                size={13}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8179AD]"
              />

              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8179AD]"
              />

            </div>

          </div>

          {/* =====================================================
              MOBILE SEARCH + FILTER
              MOBILE ONLY
          ===================================================== */}

          <div className="mt-4 md:hidden">

            {/* SEARCH */}

            <div className="flex h-[44px] w-full items-center gap-2 rounded-[11px] border border-[#E0DCF5] bg-white px-3 shadow-[0_2px_8px_rgba(36,16,101,0.03)]">

              <Search
                size={16}
                className="shrink-0 text-[#958DBA]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
                placeholder="Search customers..."
                className="w-full bg-transparent text-[12px] text-[#241065] outline-none placeholder:text-[#AAA4C1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
              />

            </div>

            {/* FILTER ROW */}

            <div className="mt-2 flex items-center justify-between gap-2">

              <div className="flex items-center gap-2 text-[10px] font-medium text-[#8179AD]">
                <UsersRound size={13} />
                <span>
                  {filteredCustomers.length}{" "}
                  {filteredCustomers.length === 1
                    ? "customer"
                    : "customers"}
                </span>
              </div>

              <div className="relative">

                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="h-[34px] min-w-[125px] appearance-none rounded-[9px] border border-[#E0DCF5] bg-white pl-8 pr-8 text-[10px] font-semibold text-[#5E5782] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
                >
                  <option value="newest">
                    Newest first
                  </option>

                  <option value="oldest">
                    Oldest first
                  </option>

                  <option value="name">
                    Name
                  </option>

                  <option value="measurements">
                    Most measurements
                  </option>
                </select>

                <Filter
                  size={12}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6133DA]"
                />

                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8179AD]"
                />

              </div>

            </div>

          </div>

          {/* =====================================================
              DESKTOP CUSTOMER TABLE
              DESKTOP ONLY
              ORIGINAL TABLE PRESERVED
          ===================================================== */}

          <div className="tk-tile mt-4 hidden overflow-hidden rounded-[10px] md:block">

            {/* TABLE HEADER */}

            <div className="hidden grid-cols-[1.5fr_1.3fr_1fr_1fr_90px] items-center border-b border-[var(--tk-glass-border)] bg-[var(--tk-surface-muted)] px-5 py-3 md:grid">

              <span className="text-[11px] font-semibold text-[#8179AD]">
                Name
              </span>

              <span className="text-[11px] font-semibold text-[#8179AD]">
                Contact
              </span>

              <span className="text-[11px] font-semibold text-[#8179AD]">
                Last Measurement
              </span>

              <span className="text-[11px] font-semibold text-[#8179AD]">
                Date Added
              </span>

              <span className="text-center text-[11px] font-semibold text-[#8179AD]">
                Actions
              </span>

            </div>

            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#D8D6FE] border-t-[#6133DA]" />

                  <p className="mt-3 text-[11px] text-[#8179AD]">
                    Loading customers...
                  </p>

                </div>

              </div>
            ) : paginatedCustomers.length > 0 ? (

              <div>

                {paginatedCustomers.map(
                  (customer) => {

                    const name =
                      getCustomerName(
                        customer
                      );

                    return (

                      <div
                        key={customer.id}
                        className="grid gap-3 border-b border-[#F0EDF8] px-5 py-3 transition hover:bg-[#FBFAFF] md:grid-cols-[1.5fr_1.3fr_1fr_1fr_90px] md:items-center"
                      >

                        {/* NAME */}

                        <div className="flex items-center gap-2">

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBE9FE] text-[10px] font-bold text-[#6133DA]">
                            {getInitials(name)}
                          </div>

                          <div>

                            <p className="text-[12px] font-semibold text-[#241065]">
                              {name}
                            </p>

                            <p className="text-[10px] text-[#A19ABA]">
                              Customer
                            </p>

                          </div>

                        </div>

                        {/* CONTACT */}

                        <div>

                          <p className="text-[11px] text-[#5E5782]">
                            {getCustomerPhone(
                              customer
                            )}
                          </p>

                        </div>

                        {/* LAST MEASUREMENT */}

                        <div>

                          <p className="text-[11px] text-[#5E5782]">
                            {formatDate(
                              customer.lastMeasurement
                            )}
                          </p>

                        </div>

                        {/* DATE ADDED */}

                        <div>

                          <p className="text-[11px] text-[#5E5782]">
                            {formatDate(
                              customer?.created_at ||
                                customer?.createdAt
                            )}
                          </p>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex items-center justify-start gap-1 md:justify-center">

                          <button
                            type="button"
                            title="Generate measurement link"
                            onClick={() =>
                              openLinkModal(
                                customer
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6133DA] transition hover:bg-[#EBE9FE]"
                          >
                            <Link2 size={13} />
                          </button>

                          <button
                            type="button"
                            title="View customer"
                            onClick={() =>
                              viewCustomer(
                                customer
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6133DA] transition hover:bg-[#EBE9FE]"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            title="Edit customer"
                            onClick={() =>
                              editCustomer(
                                customer
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6133DA] transition hover:bg-[#EBE9FE]"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            title="Delete customer"
                            onClick={() =>
                              deleteCustomer(
                                customer
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#E05252] transition hover:bg-[#FFF0F0]"
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            ) : (

              /* DESKTOP EMPTY STATE */

              <div className="flex min-h-[300px] flex-col items-center justify-center bg-[#EBE9FE] px-5 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EBE9FE] text-[#6133DA]">
                  <UsersRound size={27} />
                </div>

                <h2 className="mt-4 text-[15px] font-bold text-[#241065]">
                  No Customers Yet
                </h2>

                <p className="mt-2 max-w-[400px] text-[11px] leading-5 text-[#8179AD]">
                  Customers you add will appear
                  here. Add a customer, then use
                  the link icon to generate a
                  personal measurement link for
                  them.
                </p>

                <button
                  type="button"
                  className="mt-3 flex items-center gap-2 text-[11px] font-medium text-[#6133DA]"
                >
                  <PlayCircle size={13} />
                  Learn How It Works
                </button>

              </div>

            )}

          </div>

          {/* =====================================================
              MOBILE CUSTOMER AREA
              MOBILE ONLY
          ===================================================== */}

          <div className="mt-4 md:hidden">

            {loading ? (

              /* MOBILE LOADING */

              <div className="rounded-[14px] tk-tile px-5 py-12 text-center">

                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#D8D6FE] border-t-[#6133DA]" />

                <p className="mt-3 text-[11px] text-[#8179AD]">
                  Loading customers...
                </p>

              </div>

            ) : paginatedCustomers.length > 0 ? (

              /* =================================================
                 MOBILE CUSTOMER CARDS
              ================================================= */

              <div className="space-y-3">

                {paginatedCustomers.map(
                  (customer) => {

                    const name =
                      getCustomerName(
                        customer
                      );

                    return (

                      <div
                        key={customer.id}
                        className="tk-tile overflow-hidden rounded-[15px]"
                      >

                        {/* TOP */}

                        <div className="px-4 pt-4">

                          <div className="flex items-start justify-between gap-3">

                            {/* CUSTOMER */}

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBE9FE] text-[12px] font-bold text-[#6133DA]">
                                {getInitials(name)}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-[13px] font-bold text-[#241065]">
                                  {name}
                                </p>

                                <p className="mt-1 truncate text-[10px] text-[#8179AD]">
                                  {getCustomerPhone(
                                    customer
                                  )}
                                </p>

                              </div>

                            </div>

                            {/* MEASUREMENTS */}

                            <div className="shrink-0 rounded-[8px] bg-[#EBE9FE] px-2.5 py-1.5 text-center">

                              <p className="text-[14px] font-bold leading-none text-[#6133DA]">
                                {customer.measurementCount}
                              </p>

                              <p className="mt-1 text-[7px] font-medium uppercase tracking-[0.3px] text-[#8179AD]">
                                Measurements
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* DETAILS */}

                        <div className="mx-4 mt-4 grid grid-cols-2 overflow-hidden rounded-[10px] bg-[var(--tk-surface-muted)]">

                          <div className="border-r border-[var(--tk-border)] px-3 py-2.5">

                            <p className="text-[8px] font-medium uppercase tracking-[0.4px] text-[var(--tk-ink-muted)]">
                              Last measurement
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-[var(--tk-ink-soft)]">
                              {formatDate(
                                customer.lastMeasurement
                              )}
                            </p>

                          </div>

                          <div className="px-3 py-2.5">

                            <p className="text-[8px] font-medium uppercase tracking-[0.4px] text-[var(--tk-ink-muted)]">
                              Date added
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-[var(--tk-ink-soft)]">
                              {formatDate(
                                customer?.created_at ||
                                  customer?.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="mt-3 flex items-center border-t border-[#F0EDF8] px-2 py-2.5">

                          <button
                            type="button"
                            onClick={() =>
                              openLinkModal(
                                customer
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] py-1.5 text-[10px] font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
                          >
                            <Link2 size={13} />
                            Link
                          </button>

                          <div className="h-5 w-px bg-[#EAE7F3]" />

                          <button
                            type="button"
                            onClick={() =>
                              viewCustomer(
                                customer
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] py-1.5 text-[10px] font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
                          >
                            <Eye size={13} />
                            View
                          </button>

                          <div className="h-5 w-px bg-[#EAE7F3]" />

                          <button
                            type="button"
                            onClick={() =>
                              editCustomer(
                                customer
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] py-1.5 text-[10px] font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <div className="h-5 w-px bg-[#EAE7F3]" />

                          <button
                            type="button"
                            onClick={() =>
                              deleteCustomer(
                                customer
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] py-1.5 text-[10px] font-semibold text-[#E05252] transition hover:bg-[#FFF0F0]"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            ) : (

              /* =================================================
                 MOBILE EMPTY STATE
              ================================================= */

              <div className="rounded-[15px] tk-tile px-5 py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBE9FE] text-[#6133DA]">
                  <UsersRound size={23} />
                </div>

                <h2 className="mt-3 text-[14px] font-bold text-[#241065]">
                  No Customers Yet
                </h2>

                <p className="mx-auto mt-2 max-w-[280px] text-[10px] leading-5 text-[#8179AD]">
                  Customers you add will appear
                  here. Add a customer, then tap
                  the link icon to generate their
                  measurement link.
                </p>

                <button
                  type="button"
                  className="mx-auto mt-3 flex items-center gap-2 text-[10px] font-medium text-[#6133DA]"
                >
                  <PlayCircle size={13} />
                  Learn How It Works
                </button>

              </div>

            )}

          </div>

          {/* =====================================================
              DESKTOP PAGINATION
              DESKTOP ONLY
          ===================================================== */}

          {filteredCustomers.length > 0 && (

            <div className="mt-4 hidden flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:flex">

              <span className="text-[10px] text-[#8179AD]">

                Showing{" "}
                {startIndex + 1} to{" "}
                {Math.min(
                  startIndex +
                    ITEMS_PER_PAGE,
                  filteredCustomers.length
                )}{" "}
                of{" "}
                {filteredCustomers.length}{" "}
                customers

              </span>

              <div className="flex items-center gap-1">

                <button
                  type="button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded border border-[#E0DCF5] bg-white text-[#8179AD] transition hover:bg-[#EBE9FE] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={`flex h-7 min-w-7 items-center justify-center rounded px-2 text-[10px] ${
                      safeCurrentPage ===
                      page
                        ? "bg-[#6133DA] font-semibold text-white"
                        : "border border-[#E0DCF5] bg-white text-[#8179AD] hover:bg-[#EBE9FE]"
                    }`}
                  >
                    {page}
                  </button>

                ))}

                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded border border-[#E0DCF5] bg-white text-[#8179AD] transition hover:bg-[#EBE9FE] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={13} />
                </button>

              </div>

            </div>

          )}

          {/* =====================================================
              MOBILE PAGINATION
              MOBILE ONLY
          ===================================================== */}

          {filteredCustomers.length > 0 && (

            <div className="mt-4 flex items-center justify-between md:hidden">

              <span className="text-[9px] text-[#8179AD]">

                {startIndex + 1}–
                {Math.min(
                  startIndex +
                    ITEMS_PER_PAGE,
                  filteredCustomers.length
                )}{" "}
                of{" "}
                {filteredCustomers.length}

              </span>

              <div className="flex items-center gap-1.5">

                <button
                  type="button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E0DCF5] bg-white text-[#8179AD] transition hover:bg-[#EBE9FE] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-[#6133DA] px-2 text-[10px] font-semibold text-white">
                  {safeCurrentPage}
                </div>

                <span className="text-[9px] text-[#A19ABA]">
                  of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E0DCF5] bg-white text-[#8179AD] transition hover:bg-[#EBE9FE] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>

              </div>

            </div>

          )}

          </div>
        </section>

      </main>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />

      {/* =====================================================
          GENERATE MEASUREMENT LINK MODAL (guide §5)
      ===================================================== */}

      <GenerateLinkModal
        open={linkModalOpen}
        onClose={closeLinkModal}
        customer={linkTarget}
      />

      <AddCustomerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleCustomerCreated}
      />


      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete customer"
        description={
          pendingDelete
            ? `Are you sure you want to delete ${getCustomerName(
                pendingDelete
              )}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        onConfirm={confirmDeleteCustomer}
        onCancel={() => setPendingDelete(null)}
      />

    </div>
  );
}