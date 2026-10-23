import { useEffect, useState } from "react";
import { ArrowLeft, Link2, Ruler } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import Toast from "../components/Toast";
import GenerateLinkModal from "../components/GenerateLinkModal";
import { getCustomers, getMeasurements } from "../services/api";

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [measurement, setMeasurement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Per-customer measurement link generation (guide §5). The shared
  // GenerateLinkModal owns the order-reference field, loading, result and
  // any backend error; the customer here is locked (no picker).
  const [linkOpen, setLinkOpen] = useState(false);

  const [toast, setToast] = useState(null); // { message, tone }

  /*
  |--------------------------------------------------------------------------
  | LOAD CUSTOMER + LATEST MEASUREMENT
  |--------------------------------------------------------------------------
  |
  | The .NET backend has no single "customer with measurements" endpoint, so
  | we compose from GET /api/customers and GET /api/measurements
  | (guide §4.2, §5.1) and pick the newest measurement for this customer.
  |
  */

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const [customers, measurements] = await Promise.all([
          getCustomers(),
          getMeasurements(),
        ]);

        if (!active) return;

        const customerId = Number(id);
        const match =
          (Array.isArray(customers) ? customers : []).find(
            (c) => c.id === customerId
          ) || null;

        const customerMeasurements = (
          Array.isArray(measurements) ? measurements : []
        )
          .filter((m) => m.customerId === customerId)
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );

        setCustomer(match);
        setMeasurement(customerMeasurements[0] || null);
      } catch (error) {
        console.error("Unable to load customer details:", error);
        if (active) {
          setCustomer(null);
          setMeasurement(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return "Not set";
  };

  const getCustomerName = () => {
    const combined = [customer?.firstName, customer?.lastName]
      .filter(Boolean)
      .join(" ");
    return getValue(combined, customer?.fullName, customer?.name);
  };

  const getCustomerPhone = () => {
    return getValue(
      customer?.phoneNumber,
      customer?.phone,
      customer?.contact
    );
  };

  /*
  |--------------------------------------------------------------------------
  | GENERATE MEASUREMENT LINK (guide §5)
  |--------------------------------------------------------------------------
  */

  const openLinkModal = () => {
    setLinkOpen(true);
  };

  const closeLinkModal = () => {
    setLinkOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | MEASUREMENT VALUES
  |--------------------------------------------------------------------------
  */

  const measurementFields = [
    {
      label: "Shoulder",
      field: "shoulderWidth",
      value: getValue(measurement?.shoulderWidth),
    },

    {
      label: "Bust / Chest",
      field: "chestCircumference",
      value: getValue(measurement?.chestCircumference),
    },

    {
      label: "Waist",
      field: "waistCircumference",
      value: getValue(measurement?.waistCircumference),
    },

    {
      label: "Arm Length",
      field: "armLength",
      value: getValue(measurement?.armLength),
    },

    {
      label: "Hips",
      field: "hipCircumference",
      value: getValue(measurement?.hipCircumference),
    },

    {
      label: "Leg Length",
      field: "legLength",
      value: getValue(measurement?.legLength),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen bg-transparent">
        <DashboardSidebar activeLabel="Customers" />

        <main className="flex min-h-screen items-center justify-center lg:ml-[240px]">
          <div className="text-center">

            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#D8D6FE] border-t-[#6133DA]" />

            <p className="mt-3 text-sm text-[#8179AD]">
              Loading customer...
            </p>

          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!customer) {
    return (
      <div className="relative z-10 min-h-screen bg-transparent text-[#241065]">

        <DashboardSidebar activeLabel="Customers" />

        <main className="min-h-screen lg:ml-[240px]">

          <header className="flex h-[88px] items-center px-4 sm:px-6 lg:h-[56px] lg:px-8">

            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-[#241065]  transition hover:bg-[#EBE9FE]"
            >
              <ArrowLeft size={13} />

              Back
            </button>

          </header>

          <section className="flex min-h-[60vh] items-center justify-center px-4 pb-[calc(88px+env(safe-area-inset-bottom))] sm:px-6 lg:px-7 lg:pb-14">

            <div className="text-center">

              <Ruler
                size={26}
                className="mx-auto text-[#BDB4F7]"
              />

              <p className="mt-3 text-sm font-medium text-[#5E5782]">
                Customer not found
              </p>

              <p className="mt-1 text-xs text-[#8179AD]">
                This customer may have been deleted, or the
                link is incorrect.
              </p>

              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="mt-5 rounded-[5px] bg-[#6133DA] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#5128BC]"
              >
                Back to customers
              </button>

            </div>

          </section>

        </main>

      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen bg-transparent text-[#241065]">

      <DashboardSidebar activeLabel="Customers" />

      <main className="min-h-screen lg:ml-[240px]">

        {/* BACK HEADER */}

        <header className="flex h-[88px] items-center justify-between px-4 sm:px-6 lg:h-[56px] lg:px-8">

          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-[#241065]  transition hover:bg-[#EBE9FE]"
          >
            <ArrowLeft size={13} />

            Back
          </button>

          <button
            type="button"
            onClick={openLinkModal}
            className="flex items-center gap-2 rounded-md bg-[#6133DA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5128BC]"
          >
            <Link2 size={13} />
            Generate link
          </button>

        </header>

        {/* CONTENT */}

        <section className="mx-auto w-full max-w-[1180px] px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 lg:px-7 lg:pb-14 lg:pt-5">

          {/* TITLE */}

          <div className="mb-7 text-center">

            <h1 className="text-xl font-bold text-[#241065]">
              Customer Information
            </h1>

            <p className="mt-1 text-xs text-[#8179AD]">
              You can view your customer's details
            </p>

          </div>

          {/* MAIN GRID */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_190px]">

            {/* LEFT */}

            <div>

              {/* PERSONAL INFORMATION */}

              <div className="rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

                <div className="border-b border-[#DDD8F6] px-4 py-3">

                  <h2 className="text-xs font-bold text-[#241065]">
                    Personal Information
                  </h2>

                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">

                  <InfoField
                    label="Name"
                    value={getCustomerName()}
                  />

                  <InfoField
                    label="Phone Number"
                    value={getCustomerPhone()}
                  />

                  <InfoField
                    label="Height"
                    value={getValue(measurement?.heightCm)}
                  />

                </div>

              </div>

              {/* MEASUREMENTS */}

              <div className="mt-4 rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

                <div className="flex items-center gap-3 border-b border-[#DDD8F6] px-4 py-3">

                  <h2 className="text-xs font-bold text-[#241065]">
                    Measurements
                  </h2>

                  <span className="text-xs text-[#8179AD]">
                    Generated by AI
                  </span>

                </div>

                {measurement ? (

                  <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">

                    {measurementFields.map((item) => (

                      <div
                        key={item.field}
                        className="flex min-h-[32px] items-center justify-between border-b border-[#E4E0F5] px-4 py-2"
                      >

                        <span className="text-xs text-[#5E5782]">
                          {item.label}
                        </span>

                        <span className="text-xs font-medium text-[#241065]">
                          {item.value}
                        </span>

                      </div>

                    ))}

                  </div>

                ) : (

                  <div className="px-5 py-10 text-center">

                    <Ruler
                      size={25}
                      className="mx-auto text-[#BDB4F7]"
                    />

                    <p className="mt-3 text-xs font-medium text-[#5E5782]">
                      No measurement record found
                    </p>

                    <p className="mt-1 text-xs text-[#8179AD]">
                      This customer has not submitted a
                      measurement yet.
                    </p>

                  </div>

                )}

              </div>

              {/* ACTION BUTTONS */}
              {/* Measurements are produced by the AI pipeline and are read-only
                  through the API (guide §5), so no edit/save controls here. */}

              <div className="mt-5 flex items-center gap-2 rounded-[5px] border border-[#DDD8F6] bg-white px-4 py-3">

                <Ruler size={13} className="text-[#8179AD]" />

                <p className="text-xs text-[#8179AD]">
                  Measurements are generated automatically by the AI scan and
                  cannot be edited here.
                </p>

              </div>

            </div>

            {/* RIGHT - RECENT SCAN */}

            <div className="h-fit rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

              <div className="border-b border-[#DDD8F6] px-4 py-3 text-center">

                <h2 className="text-xs font-bold text-[#241065]">
                  Recent Scan
                </h2>

              </div>

              <div className="p-4">

                <ScanImage
                  src={measurement?.frontImageUrl || null}
                  alt="Front scan"
                />

                <ScanImage
                  src={measurement?.sideImageUrl || null}
                  alt="Side scan"
                />

              </div>

            </div>

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
        open={linkOpen}
        onClose={closeLinkModal}
        customer={customer}
      />

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO FIELD
|--------------------------------------------------------------------------
*/

function InfoField({
  label,
  value,
}) {
  return (
    <div>

      <label className="mb-1 block text-xs font-medium text-[#8179AD]">
        {label}
      </label>

      <div className="flex h-[25px] items-center rounded-[3px] border border-[#DDD8F6] bg-white px-2 text-xs text-[#241065]">
        {value}
      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SCAN IMAGE
|--------------------------------------------------------------------------
*/

function ScanImage({
  src,
  alt,
}) {
  const [imageError, setImageError] =
    useState(false);

  if (!src || imageError) {

    return (
      <div className="mb-3 flex h-[105px] items-center justify-center overflow-hidden rounded-[4px] border border-[#DDD8F6] bg-white">

        <div className="text-center">

          <Ruler
            size={22}
            className="mx-auto text-[#C9C3E8]"
          />

          <p className="mt-2 text-xs text-[#A19ABA]">
            No scan available
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="mb-3 flex h-[105px] items-center justify-center overflow-hidden rounded-[4px] border border-[#DDD8F6] bg-white">

      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
        onError={() => setImageError(true)}
      />

    </div>
  );
}