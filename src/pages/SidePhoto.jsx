
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Image,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import guideImage from "../assets/images/side.png";

export default function SidePhoto() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [photo, setPhoto] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    /*
      Do NOT load the previous photo from localStorage.

      When the user comes back to this page,
      the camera/guide should be shown again.
    */

    setPhoto("");
    setCameraActive(false);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: {
            ideal: 1080,
          },
          height: {
            ideal: 1425,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.play().catch((error) => {
            console.error("Video play error:", error);
          });
        }
      }, 100);
    } catch (error) {
      console.error(error);

      if (error.name === "NotAllowedError") {
        alert(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else {
        alert("Unable to access the camera.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      alert("Camera is not ready yet. Please wait.");
      return;
    }

    const FRAME_WIDTH = 250;
    const FRAME_HEIGHT = 330;

    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) return;

    /*
      Capture the complete camera image.
      No object-cover.
      No cropping.
      No zoom.
    */

    context.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      FRAME_WIDTH,
      FRAME_HEIGHT
    );

    const imageData = canvas.toDataURL(
      "image/jpeg",
      0.92
    );

    setPhoto(imageData);

    /*
      Save the side photo so it can still be used
      later by the measurement process.
    */

    localStorage.setItem(
      "trendySize_side_photo",
      imageData
    );

    stopCamera();
  };

  const handleCaptureClick = () => {
    if (!cameraActive) {
      startCamera();
    } else {
      capturePhoto();
    }
  };

  const handleExistingPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      stopCamera();

      setPhoto(imageData);

      localStorage.setItem(
        "trendySize_side_photo",
        imageData
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleContinue = () => {
    if (!photo) {
      alert("Please capture or select a side photo first.");
      return;
    }

    navigate("/processing");
  };

  /*
    When Back is clicked, reset the page.

    The saved photo remains in localStorage,
    but it will not be displayed when the page
    is opened again.
  */

  const handleBack = () => {
    stopCamera();
    setPhoto("");
    navigate(-1);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F4F3FF] px-8 py-5 text-[#241065]">
      <div className="mx-auto flex h-[calc(100vh-40px)] max-h-screen w-full max-w-[1440px] flex-col overflow-hidden">

        {/* PROGRESS */}

        <div className="h-[6px] w-full overflow-hidden bg-[#A9A6B5]">
          <div className="h-full w-[55%] bg-[#6133DA]" />
        </div>

        {/* BACK */}

        <div className="mt-5">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-[38px] w-[106px] items-center justify-center gap-2 rounded-lg border border-[#D8D6FE] bg-[#EBE9FE] text-[12px] font-medium text-[#241065] transition hover:bg-[#D8D6FE]"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* TITLE */}

        <div className="mt-5 text-center">
          <h1 className="text-[28px] font-bold text-[#241065]">
            Take a Side Photo
          </h1>

          <p className="mt-1 text-[12px] text-[#6133DA]">
            Turn sideways and stand straight facing the side
          </p>
        </div>

        {/* PHOTO AREA */}

        <div className="mx-auto mt-6 flex w-full max-w-[720px] items-center justify-center gap-8">

          {/* CAMERA FRAME */}

          <div className="relative flex h-[330px] w-[250px] items-center justify-center overflow-hidden bg-white">

            {/* FRAME CORNERS */}

            {!photo && (
              <>
                <div className="absolute left-4 top-4 z-30 h-7 w-7 border-l-2 border-t-2 border-[#6133DA]" />

                <div className="absolute right-4 top-4 z-30 h-7 w-7 border-r-2 border-t-2 border-[#6133DA]" />

                <div className="absolute bottom-4 left-4 z-30 h-7 w-7 border-b-2 border-l-2 border-[#6133DA]" />

                <div className="absolute bottom-4 right-4 z-30 h-7 w-7 border-b-2 border-r-2 border-[#6133DA]" />
              </>
            )}

            {/* LIVE CAMERA */}

            {cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 z-10 h-full w-full object-fill"
              />
            )}

            {/* CAPTURED PHOTO */}

            {!cameraActive && photo && (
              <img
                src={photo}
                alt="Captured side"
                className="absolute inset-0 z-10 h-full w-full object-fill"
              />
            )}

            {/* GUIDE IMAGE */}

            {!cameraActive && !photo && (
              <img
                src={guideImage}
                alt="Side body positioning guide"
                className="absolute inset-0 z-10 h-full w-full object-fill"
              />
            )}

            {/* GUIDE MESSAGE */}

            {!cameraActive && !photo && (
              <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-md bg-white/90 px-4 py-2 text-center shadow-sm">
                <p className="text-[10px] font-medium text-[#241065]">
                  Turn sideways and align with the guide
                </p>
              </div>
            )}
          </div>

          {/* PHOTO TIPS */}

          <div className="w-[260px] rounded-lg border border-[#D8D6FE] bg-[#EBE9FE] p-5">

            <h2 className="text-[13px] font-semibold text-[#241065]">
              Photo tips
            </h2>

            <div className="mt-4 space-y-3.5">

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#16A34A]"
                  fill="#16A34A"
                  color="white"
                />

                <p className="text-[10px] text-[#241065]">
                  Turn your body sideways
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#16A34A]"
                  fill="#16A34A"
                  color="white"
                />

                <p className="text-[10px] text-[#241065]">
                  Make sure your whole body is visible
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#16A34A]"
                  fill="#16A34A"
                  color="white"
                />

                <p className="text-[10px] text-[#241065]">
                  Keep your arms relaxed at your sides
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#16A34A]"
                  fill="#16A34A"
                  color="white"
                />

                <p className="text-[10px] text-[#241065]">
                  Stand straight
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#16A34A]"
                  fill="#16A34A"
                  color="white"
                />

                <p className="text-[10px] text-[#241065]">
                  Stand on plain background
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* FILE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* CANVAS */}

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* PHOTO BUTTONS */}

        <div className="mt-4 flex justify-center gap-3">

          <button
            type="button"
            onClick={handleCaptureClick}
            className="flex h-[38px] w-[165px] items-center justify-center gap-2 rounded-lg border border-[#6133DA] bg-white text-[11px] font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
          >
            <Camera size={16} />

            {cameraActive ? "Take Photo" : "Capture Photo"}
          </button>

          <button
            type="button"
            onClick={handleExistingPhoto}
            className="flex h-[38px] w-[165px] items-center justify-center gap-2 rounded-lg border border-[#6133DA] bg-white text-[11px] font-semibold text-[#6133DA] transition hover:bg-[#EBE9FE]"
          >
            <Image size={16} />

            Using Existing Photo
          </button>

        </div>

        {/* CONTINUE */}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleContinue}
            className="mx-auto flex h-[44px] w-full max-w-[420px] items-center justify-center rounded-lg bg-[#6133DA] text-[12px] font-semibold text-white transition hover:bg-[#4D26B5]"
          >
            Continue to Next Step
          </button>
        </div>

        {/* SECURITY */}

        <div className="mt-3 flex items-center justify-center gap-1">
          <span className="text-[9px] text-[#241065]">
            ♥
          </span>

          <p className="text-[9px] text-[#241065]">
            Your photos are encrypted and secure
          </p>
        </div>

      </div>
    </div>
  );
}

