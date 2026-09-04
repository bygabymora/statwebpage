import React, { useState } from "react";
import { useModalContext } from "../context/ModalContext";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";

const ACCOUNTING_EMAIL = "accounting@statsurgicalsupply.com";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ExemptionFileUploader = ({
  customer,
  setCustomer,
  order,
  user,
  allowReupload = false,
}) => {
  const { showStatusMessage } = useModalContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const hasCertificateOnFile = Boolean(customer?.exemptionFileName);
  const isTaxExempt = customer?.taxable === false;
  const showUploadForm = allowReupload || !hasCertificateOnFile;

  const handleFileChange = (e) => {
    e.preventDefault();
    setSelectedFile(e.target.files[0]);
  };

  const notifyAccounting = async (fileName, base64Content, mimeType) => {
    const contactToEmail = { name: "Accounting", email: ACCOUNTING_EMAIL };
    const emailMessage = messageManagement(
      contactToEmail,
      "Exemption File Uploaded",
      null,
      null,
      {
        companyName: customer?.companyName,
        orderDocNumber: order?.docNumber,
        uploadedByName:
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          customer?.companyName,
        uploadedByEmail: user?.email,
        fileName,
      },
    );

    await handleSendEmails(
      emailMessage,
      contactToEmail,
      null,
      {
        type: mimeType,
        name: fileName,
        content: base64Content,
      },
      customer?.user?.email,
    );
  };

  const handleUpload = async () => {
    if (!selectedFile || !customer?._id) return;
    setUploading(true);
    try {
      // Matches the naming convention used when accounting uploads a
      // certificate from the CRM (TEC_<company>_<date>.<ext>).
      const uploadDate = new Date().toISOString().slice(2, 10);
      const ext = selectedFile.name.split(".").pop();
      const newFileName = `TEC_${customer.companyName || "Customer"}_${uploadDate}.${ext}`;
      const renamedFile = new File([selectedFile], newFileName, {
        type: selectedFile.type,
      });

      const base64Content = await fileToBase64(renamedFile);

      const formData = new FormData();
      formData.append("file", renamedFile);
      formData.append("customerId", customer._id);

      const response = await fetch("/api/customers/uploadExemptionFile", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data?.customer) {
        throw new Error(data?.message || "Failed to upload exemption file");
      }

      setCustomer((prev) => ({
        ...prev,
        exemptionFileId: data.customer?.exemptionFileId,
        exemptionFileName: data.customer?.exemptionFileName,
      }));

      try {
        await notifyAccounting(
          data.customer?.exemptionFileName || newFileName,
          base64Content,
          renamedFile.type,
        );
      } catch (emailError) {
        console.error("Error notifying accounting:", emailError);
      }

      setSelectedFile(null);
      showStatusMessage(
        "success",
        "Exemption certificate uploaded. Our accounting team will review it and update your account.",
      );
    } catch (error) {
      console.error("Error uploading exemption file:", error);
      showStatusMessage("error", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='bg-white shadow-lg p-6 rounded-lg border mt-5'>
      <h2 className='mb-2 text-xl font-semibold text-[#0e355e]'>
        Tax Exemption Certificate
      </h2>
      {hasCertificateOnFile &&
        (isTaxExempt ?
          <div className='p-3 mb-3 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-800'>
            <p className='font-semibold'>You are tax exempt.</p>
            <p className='text-sm mt-1'>
              Your account is on file as tax-exempt (certificate:{" "}
              {customer.exemptionFileName}).
            </p>
          </div>
        : <div className='p-3 mb-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-blue-800'>
            <p className='font-semibold'>
              Certificate on file: {customer.exemptionFileName}
            </p>
            <p className='text-sm mt-1'>
              Our accounting team is reviewing it and will update your
              account&apos;s tax status once verified.
            </p>
          </div>)}
      {showUploadForm && (
        <>
          <p className='text-gray-600 mb-3'>
            {hasCertificateOnFile ?
              "Need to upload a new or updated certificate? Select a file below."
            : "If your organization is tax-exempt, upload your exemption certificate here. Our accounting team will review it and update your account's tax status."
            }
          </p>
          <div className='flex flex-col sm:flex-row gap-2'>
            <input
              autoComplete='off'
              type='file'
              onChange={handleFileChange}
              className='w-full px-3 py-2 text-sm text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline h-[2.5rem]'
            />
            <button
              type='button'
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
              className='primary-button h-10 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExemptionFileUploader;
