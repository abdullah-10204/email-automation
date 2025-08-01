"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rixdrbokebnvidwyzvzo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRyYm9rZWJudmlkd3l6dnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MjMzMzIsImV4cCI6MjA0ODE5OTMzMn0.Zhnz5rLRoIhtHyF52pFjzYijNdxgZBvEr9LtOxR2Lhw";
const supabase = createClient(supabaseUrl, supabaseKey);

const ReceiptUpload = ({ surveyId, mainUserId, surveyObjectId }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [survayData, setSurvayData] = useState([]);
  const [survayBidAmount, setSurvayBidAmount] = useState([]);
  const [isReceiptUpload, setIsReceiptUpload] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const sendToAdmin = async () => {
    if (!file || !profileData) return;
    setIsReceiptUpload(true);
    try {
      const filePath = `receipts/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("new-project")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading file to Supabase:", error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("new-project")
        .getPublicUrl(filePath);

      const receiptFormLink = publicUrlData?.publicUrl;

      await axios.post("/api/routes/Admin?action=uploadReciptData", {
        executiveEmail: profileData?.userProfileEmail || "",
        executiveName: profileData?.userName || "",
        salesRepresentiveEmail: profileData?.userProfileEmail || "",
        salesRepresentiveName: profileData?.userName || "",
        donation: survayBidAmount,
        receiptFormLink,
        userId: mainUserId,
        surveyId: surveyId,
      });

      setFile(null);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error in sendToAdmin:", error);
    } finally {
      setIsReceiptUpload(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!mainUserId) {
          console.error("No userId found in search params");
          return;
        }

        const response = await axios.get(`/api/routes/ProfileInfo`, {
          params: { userId: mainUserId, action: "getProfileInfo" },
        });

        setProfileData(response.data.user);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    const fetchSurvayData = async () => {
      try {
        const response = await axios.post(
          `/api/routes/SurvayForm?action=fetchNameAgainstId`,
          {
            surveyObjectId,
          }
        );

        setSurvayData(response.data.name);
        setSurvayBidAmount(response.data.bidAmount);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    if (mainUserId) {
      fetchProfileData();
    }

    if (surveyId) {
      fetchSurvayData();
    }
  }, [mainUserId, surveyId]);

  if (isSubmitted) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 w-full items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center gap-6 border-b-2 border-[#2C514C] shadow-[0_8px_30px_rgb(0,0,0,0.10)] max-w-2xl w-full">
          <div className="p-4 bg-[#2C514C]/10 rounded-full">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#2C514C" opacity="0.1" />
              <path
                d="M16 9L10.5 15L8 12.5"
                stroke="#2C514C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#2C514C] mb-2">
              Receipt Submitted Successfully! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Your receipt has been submitted to admin for approval.
            </p>
            <p className="text-lg text-gray-500 mt-2">
              Thank you for your donation to {profileData?.charityCompany || "the charity"}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <h1 className="text-4xl font-semibold text-black mb-6">
          Upload Your Receipt Here
        </h1>

        <div className="mb-6 text-[16px]">
          <p className="text-gray-700 mb-2">
            {`Dear ${survayData || "Guest"}`}
          </p>
          <p className="text-gray-700 mb-4">
            {`Great news! ${profileData?.userName} has accepted your meeting request.`}
          </p>

          <p className="text-gray-700 mb-4">
            we will give you all a link to make the donation to include on this page as well, give us a few to set that up.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-black text-[20px] mb-2">
            File Upload
          </h2>
          <div className="border-b border-gray-300 mb-4"></div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-12 h-12 text-[rgba(72,72,72,1)] mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-gray-600 mb-1">
                {file
                  ? file.name
                  : isDragging
                    ? "Drop your file here"
                    : "Click or drag file to this area to upload"}
              </p>
              <p className="text-sm text-gray-500">
                Formats accepted are .pdf, .docx, .png, .jpg, .jpeg
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={sendToAdmin}
            className="px-6 py-3 rounded-lg bg-[rgba(44,81,76,1)] text-white hover:bg-gray-400 disabled:opacity-50 transition cursor-pointer flex items-center justify-center"
            disabled={!file}
          >
            {isReceiptUpload ? "Loading..." : "Send to Admin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;