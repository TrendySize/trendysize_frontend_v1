
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Image,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import guideImage from "../assets/images/front.png";

export default function FrontPhoto() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [photo, setPhoto] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const startCamera = async () => {
    setError("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",

          // Request a portrait-shaped camera feed
          // matching the 250 x 330 frame.
          aspectRatio: {
            ideal: 250 / 330,
          },

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

          videoRef.current
            .play()
            .catch((error) => {
              console.error("Video play error:", error);
            });
        }
      }, 100);
    } catch (error) {
      console.error(error);

      if (error.name === "NotAllowedError") {
        setError(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else {
        setError("Unable to access the camera.");
      }
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready yet. Please wait.");
      return;
    }

    /*
      The camera frame is 250 x 330.

      We capture the COMPLETE camera image.
      Nothing is cropped and nothing is zoomed.

      The canvas uses the exact same ratio as
      the visible camera frame.
    */

    const FRAME_WIDTH = 250;
    const FRAME_HEIGHT = 330;

    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) return;

    /*
      Draw the COMPLETE camera image into the
      exact frame dimensions.

      This does NOT crop any part of the camera.
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

    localStorage.setItem(
      "trendySize_front_photo",
      imageData
    );

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
      setError("Please select an image file.");
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

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
      setPhoto(imageData);

      localStorage.setItem(
        "trendySize_front_photo",
        imageData
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleContinue = () => {
    if (!photo) {
      setError("Please capture or select a front photo first.");
      return;
    }

    setError("");
    navigate("/side-photo");
  };

  return (
    <div className="relative min-h-screen bg-transparent px-4 py-5 text-[var(--tk-ink)] sm:px-8">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[1440px] flex-col">

        <div className="h-[6px] w-full overflow-hidden bg-[#A9A6B5]">
          <div className="h-full w-[38%] bg-[#6133DA]" />
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => navigate("/how-it-works")}
            className="flex h-[38px] w-[106px] items-center justify-center gap-2 rounded-lg border border-[#D8D6FE] bg-[#EBE9FE] text-xs font-medium text-[#241065] transition hover:bg-[#D8D6FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back
          </button>
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-3xl font-bold text-[#241065]">
            Take a Front Photo
          </h1>

          <p className="mt-1 text-xs text-[#4C2BB0]">
            Stand straight facing the camera
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mx-auto mt-4 w-full max-w-[720px] rounded-lg border border-[#FECACA] bg-[#FFF7F7] px-4 py-2 text-center text-xs font-medium text-[#B91C1C]"
          >
            {error}
          </p>
        )}

        <div className="mx-auto mt-6 flex w-full max-w-[720px] flex-col items-center justify-center gap-8 sm:flex-row">

          {/* CAMERA FRAME */}

          <div className="relative flex h-[330px] w-[250px] items-center justify-center overflow-hidden bg-white">

            {/* Camera frame corners only show BEFORE photo */}
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
                alt="Captured front"
                className="absolute inset-0 z-10 h-full w-full object-fill"
              />
            )}

            {/* GUIDE IMAGE */}

            {!cameraActive && !photo && (
              <img
                src={guideImage}
                alt="Body positioning guide"
                className="absolute inset-0 z-10 h-full w-full object-fill"
              />
            )}

            {/* GUIDE MESSAGE */}

            {!cameraActive && !photo && (
              <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-md bg-white/90 px-4 py-2 text-center ">
                <p className="text-xs font-medium text-[#241065]">
                  Align yourself with the guide
                </p>
              </div>
            )}
          </div>

          {/* PHOTO TIPS */}

          <div className="w-full max-w-[340px] rounded-lg border border-[#D8D6FE] bg-[#EBE9FE] p-5 sm:w-[260px]">

            <h2 className="text-sm font-semibold text-[#241065]">
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

                <p className="text-xs text-[#241065]">
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

                <p className="text-xs text-[#241065]">
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

                <p className="text-xs text-[#241065]">
                  Look straight ahead
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#16A34A]"
                  fill="#16A34A"
                  color="white"
                />

                <p className="text-xs text-[#241065]">
                  Wear fitted clothing
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#16A34A]"
                  fill="#16A34A"
                  color="white"
                />

                <p className="text-xs text-[#241065]">
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

        {/* CAPTURE CANVAS */}

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* ACTION BUTTONS */}

        <div className="mt-4 flex justify-center gap-3">

          <button
            type="button"
            onClick={handleCaptureClick}
            className="flex h-[38px] w-[165px] items-center justify-center gap-2 rounded-lg border border-[#6133DA] bg-white text-xs font-semibold text-[#4C2BB0] transition hover:bg-[#EBE9FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
          >
            <Camera size={16} aria-hidden="true" />

            {cameraActive ? "Take Photo" : "Capture Photo"}
          </button>

          <button
            type="button"
            onClick={handleExistingPhoto}
            className="flex h-[38px] w-[165px] items-center justify-center gap-2 rounded-lg border border-[#6133DA] bg-white text-xs font-semibold text-[#4C2BB0] transition hover:bg-[#EBE9FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40"
          >
            <Image size={16} aria-hidden="true" />
            Using Existing Photo
          </button>

        </div>

        {/* CONTINUE */}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleContinue}
            className="mx-auto flex h-[44px] w-full max-w-[420px] items-center justify-center rounded-lg bg-[#6133DA] text-xs font-semibold text-white transition hover:bg-[#4D26B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6133DA]/40 focus-visible:ring-offset-2"
          >
            Continue to Next Step
          </button>
        </div>

        {/* SECURITY MESSAGE */}

        <div className="mt-3 flex items-center justify-center gap-1">
          <span aria-hidden="true" className="text-xs text-[#6D4CE0]">
            ♥
          </span>

          <p className="text-xs text-[#241065]">
            Your photos are encrypted and secure
          </p>
        </div>

      </div>
    </div>
  );
}


