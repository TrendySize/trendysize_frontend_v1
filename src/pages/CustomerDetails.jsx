import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  Save,
  Ruler,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";

export default function CustomerDetails() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [measurement, setMeasurement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FRONTEND TEST MODE
  |--------------------------------------------------------------------------
  |
  | No Laravel
  | No API
  | No database
  | No customer data
  |
  | This allows us to see and test the complete Customer Details layout.
  |
  */

  useEffect(() => {
    setLoading(false);
    setCustomer(null);
    setMeasurement(null);
  }, []);

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

    return "—";
  };

  const getCustomerName = () => {
    return getValue(
      customer?.name,
      customer?.full_name,
      customer?.fullName
    );
  };

  const getCustomerPhone = () => {
    return getValue(
      customer?.phone,
      customer?.phone_number,
      customer?.phoneNumber,
      customer?.contact
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE MEASUREMENT
  |--------------------------------------------------------------------------
  */

  const updateMeasurement = (field, value) => {
    setMeasurement((previous) => ({
      ...(previous || {}),
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE MEASUREMENT
  |--------------------------------------------------------------------------
  |
  | Frontend test only.
  | No backend request is made.
  |
  */

  const saveMeasurement = () => {
    if (!measurement) {
      return;
    }

    try {
      setSaving(true);

      setTimeout(() => {
        setEditing(false);
        setSaving(false);
      }, 500);
    } catch (error) {
      console.error("Save measurement error:", error);
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | MEASUREMENT VALUES
  |--------------------------------------------------------------------------
  */

  const measurementFields = [
    {
      label: "Shoulder",
      field: "shoulder",
      value: getValue(
        measurement?.shoulder,
        measurement?.shoulder_width
      ),
    },

    {
      label: "Bust / Chest",
      field: "bust",
      value: getValue(
        measurement?.bust,
        measurement?.chest
      ),
    },

    {
      label: "Waist",
      field: "waist",
      value: getValue(
        measurement?.waist
      ),
    },

    {
      label: "Arm Length",
      field: "arm_length",
      value: getValue(
        measurement?.arm_length,
        measurement?.sleeve_length
      ),
    },

    {
      label: "Hips",
      field: "hips",
      value: getValue(
        measurement?.hips
      ),
    },

    {
      label: "Half Length",
      field: "half_length",
      value: getValue(
        measurement?.half_length
      ),
    },

    {
      label: "Thigh",
      field: "thigh",
      value: getValue(
        measurement?.thigh
      ),
    },

    {
      label: "Round Sleeve",
      field: "round_sleeve",
      value: getValue(
        measurement?.round_sleeve,
        measurement?.sleeve
      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F3FF]">
        <DashboardSidebar activeLabel="Customers" />

        <main className="flex min-h-screen items-center justify-center lg:ml-[220px]">
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
  | CUSTOMER DETAILS EMPTY DESIGN
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | We deliberately render the page even when there is no customer.
  |
  */

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">

        <DashboardSidebar activeLabel="Customers" />

        <main className="min-h-screen lg:ml-[220px]">

          {/* ------------------------------------------------------------- */}
          {/* BACK HEADER */}
          {/* ------------------------------------------------------------- */}

          <header className="flex h-[64px] items-center px-5 lg:px-8">

            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[12px] font-medium text-[#241065] shadow-sm transition hover:bg-[#EBE9FE]"
            >
              <ArrowLeft size={13} />

              Back
            </button>

          </header>

          {/* ------------------------------------------------------------- */}
          {/* CONTENT */}
          {/* ------------------------------------------------------------- */}

          <section className="px-5 pb-10 lg:px-8">

            {/* --------------------------------------------------------- */}
            {/* TITLE */}
            {/* --------------------------------------------------------- */}

            <div className="mb-7 text-center">

              <h1 className="text-[20px] font-bold text-[#241065]">
                Customer Information
              </h1>

              <p className="mt-1 text-[11px] text-[#8179AD]">
                You can view your customer's details
              </p>

            </div>

            {/* --------------------------------------------------------- */}
            {/* MAIN GRID */}
            {/* --------------------------------------------------------- */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_190px]">

              {/* ======================================================= */}
              {/* LEFT COLUMN */}
              {/* ======================================================= */}

              <div>

                {/* ----------------------------------------------------- */}
                {/* PERSONAL INFORMATION */}
                {/* ----------------------------------------------------- */}

                <div className="rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

                  <div className="border-b border-[#DDD8F6] px-4 py-3">

                    <h2 className="text-[12px] font-bold text-[#241065]">
                      Personal Information
                    </h2>

                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">

                    {/* NAME */}

                    <InfoField
                      label="Name"
                      value="—"
                    />

                    {/* PHONE */}

                    <InfoField
                      label="Phone Number"
                      value="—"
                    />

                    {/* HEIGHT */}

                    <EditableField
                      label="Height"
                      value="—"
                      editing={false}
                      onChange={() => {}}
                    />

                  </div>

                </div>

                {/* ----------------------------------------------------- */}
                {/* MEASUREMENTS */}
                {/* ----------------------------------------------------- */}

                <div className="mt-4 rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

                  {/* HEADER */}

                  <div className="flex items-center gap-3 border-b border-[#DDD8F6] px-4 py-3">

                    <h2 className="text-[12px] font-bold text-[#241065]">
                      Measurements
                    </h2>

                    <span className="text-[10px] text-[#8179AD]">
                      Generated by AI
                    </span>

                  </div>

                  {/* EMPTY MEASUREMENT STATE */}

                  <div className="px-5 py-10 text-center">

                    <Ruler
                      size={25}
                      className="mx-auto text-[#BDB4F7]"
                    />

                    <p className="mt-3 text-[12px] font-medium text-[#5E5782]">
                      No measurement record found
                    </p>

                    <p className="mt-1 text-[10px] text-[#8179AD]">
                      This customer has not submitted a
                      measurement yet.
                    </p>

                  </div>

                </div>

                {/* ----------------------------------------------------- */}
                {/* ACTION BUTTONS */}
                {/* ----------------------------------------------------- */}

                <div className="mt-5 flex gap-3">

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex h-[36px] flex-1 items-center justify-center gap-2 rounded-[5px] border border-[#6133DA] bg-transparent text-[12px] font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
                  >
                    <Edit3 size={13} />

                    Edit
                  </button>

                  {/* SAVE */}

                  <button
                    type="button"
                    disabled
                    className="flex h-[36px] flex-1 items-center justify-center gap-2 rounded-[5px] bg-[#6133DA] text-[12px] font-semibold text-white opacity-40"
                  >
                    <Save size={13} />

                    Save measurement
                  </button>

                </div>

              </div>

              {/* ======================================================= */}
              {/* RIGHT COLUMN */}
              {/* ======================================================= */}

              <div className="h-fit rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

                {/* ----------------------------------------------------- */}
                {/* RECENT SCAN HEADER */}
                {/* ----------------------------------------------------- */}

                <div className="border-b border-[#DDD8F6] px-4 py-3 text-center">

                  <h2 className="text-[12px] font-bold text-[#241065]">
                    Recent Scan
                  </h2>

                </div>

                {/* ----------------------------------------------------- */}
                {/* SCAN IMAGES */}
                {/* ----------------------------------------------------- */}

                <div className="p-4">

                  <ScanImage
                    src={null}
                    alt="Front scan"
                  />

                  <ScanImage
                    src={null}
                    alt="Side scan"
                  />

                </div>

              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER DATA PAGE
  |--------------------------------------------------------------------------
  |
  | This section will automatically be used later when real customer
  | information is connected.
  |
  */

  return (
    <div className="min-h-screen bg-[#F4F3FF] text-[#241065]">

      <DashboardSidebar activeLabel="Customers" />

      <main className="min-h-screen lg:ml-[220px]">

        {/* BACK HEADER */}

        <header className="flex h-[64px] items-center px-5 lg:px-8">

          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[12px] font-medium text-[#241065] shadow-sm transition hover:bg-[#EBE9FE]"
          >
            <ArrowLeft size={13} />

            Back
          </button>

        </header>

        {/* CONTENT */}

        <section className="px-5 pb-10 lg:px-8">

          {/* TITLE */}

          <div className="mb-7 text-center">

            <h1 className="text-[20px] font-bold text-[#241065]">
              Customer Information
            </h1>

            <p className="mt-1 text-[11px] text-[#8179AD]">
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

                  <h2 className="text-[12px] font-bold text-[#241065]">
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

                  <EditableField
                    label="Height"
                    value={getValue(
                      measurement?.height,
                      customer?.height
                    )}
                    editing={editing}
                    onChange={(value) =>
                      updateMeasurement(
                        "height",
                        value
                      )
                    }
                  />

                </div>

              </div>

              {/* MEASUREMENTS */}

              <div className="mt-4 rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

                <div className="flex items-center gap-3 border-b border-[#DDD8F6] px-4 py-3">

                  <h2 className="text-[12px] font-bold text-[#241065]">
                    Measurements
                  </h2>

                  <span className="text-[10px] text-[#8179AD]">
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

                        <span className="text-[11px] text-[#5E5782]">
                          {item.label}
                        </span>

                        {editing ? (

                          <input
                            type="text"
                            value={
                              measurement?.[
                                item.field
                              ] || ""
                            }
                            onChange={(event) =>
                              updateMeasurement(
                                item.field,
                                event.target.value
                              )
                            }
                            className="w-[90px] rounded border border-[#6133DA] bg-white px-2 py-1 text-right text-[11px] text-[#241065] outline-none"
                          />

                        ) : (

                          <span className="text-[11px] font-medium text-[#241065]">
                            {item.value}
                          </span>

                        )}

                      </div>

                    ))}

                  </div>

                ) : (

                  <div className="px-5 py-10 text-center">

                    <Ruler
                      size={25}
                      className="mx-auto text-[#BDB4F7]"
                    />

                    <p className="mt-3 text-[12px] font-medium text-[#5E5782]">
                      No measurement record found
                    </p>

                    <p className="mt-1 text-[10px] text-[#8179AD]">
                      This customer has not submitted a
                      measurement yet.
                    </p>

                  </div>

                )}

              </div>

              {/* ACTION BUTTONS */}

              <div className="mt-5 flex gap-3">

                {!editing ? (

                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex h-[36px] flex-1 items-center justify-center gap-2 rounded-[5px] border border-[#6133DA] bg-transparent text-[12px] font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
                    >
                      <Edit3 size={13} />

                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={!measurement}
                      onClick={() => setEditing(true)}
                      className="flex h-[36px] flex-1 items-center justify-center gap-2 rounded-[5px] bg-[#6133DA] text-[12px] font-semibold text-white transition hover:bg-[#5128BC] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Save size={13} />

                      Save measurement
                    </button>
                  </>

                ) : (

                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex h-[36px] flex-1 items-center justify-center rounded-[5px] border border-[#6133DA] text-[12px] font-semibold text-[#6133DA]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={saving || !measurement}
                      onClick={saveMeasurement}
                      className="flex h-[36px] flex-1 items-center justify-center gap-2 rounded-[5px] bg-[#6133DA] text-[12px] font-semibold text-white disabled:opacity-50"
                    >
                      <Save size={13} />

                      {saving
                        ? "Saving..."
                        : "Save measurement"}
                    </button>
                  </>

                )}

              </div>

            </div>

            {/* RIGHT - RECENT SCAN */}

            <div className="h-fit rounded-[7px] border border-[#BDB4F7] bg-[#F4F3FF]">

              <div className="border-b border-[#DDD8F6] px-4 py-3 text-center">

                <h2 className="text-[12px] font-bold text-[#241065]">
                  Recent Scan
                </h2>

              </div>

              <div className="p-4">

                <ScanImage
                  src={
                    measurement?.front_image ||
                    measurement?.frontImage ||
                    measurement?.image_front ||
                    measurement?.front_photo ||
                    customer?.front_image ||
                    null
                  }
                  alt="Front scan"
                />

                <ScanImage
                  src={
                    measurement?.side_image ||
                    measurement?.sideImage ||
                    measurement?.image_side ||
                    measurement?.side_photo ||
                    customer?.side_image ||
                    null
                  }
                  alt="Side scan"
                />

              </div>

            </div>

          </div>

        </section>

      </main>

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

      <label className="mb-1 block text-[10px] font-medium text-[#8179AD]">
        {label}
      </label>

      <div className="flex h-[25px] items-center rounded-[3px] border border-[#DDD8F6] bg-white px-2 text-[10px] text-[#241065]">
        {value}
      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EDITABLE FIELD
|--------------------------------------------------------------------------
*/

function EditableField({
  label,
  value,
  editing,
  onChange,
}) {
  return (
    <div>

      <label className="mb-1 block text-[10px] font-medium text-[#8179AD]">
        {label}
      </label>

      {editing ? (

        <input
          type="text"
          value={value === "—" ? "" : value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-[25px] w-full rounded-[3px] border border-[#6133DA] bg-white px-2 text-[10px] text-[#241065] outline-none"
        />

      ) : (

        <div className="flex h-[25px] items-center rounded-[3px] border border-[#DDD8F6] bg-white px-2 text-[10px] text-[#241065]">
          {value}
        </div>

      )}

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

          <p className="mt-2 text-[10px] text-[#A19ABA]">
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