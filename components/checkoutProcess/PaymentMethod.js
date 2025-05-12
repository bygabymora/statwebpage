import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useModalContext } from "../context/ModalContext";
import axios from "axios";

export default function PaymentMethod({
  setActiveStep,
  order,
  setOrder,
  customer,
  fetchOrder,
}) {
  const { showStatusMessage } = useModalContext();

  const [selectedMethod, setSelectedMethod] = useState(
    order.paymentMethod || null
  );
  const [newFile, setNewFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!order.shippingAddress?.address) {
      setActiveStep(1);
    }
  }, [order.shippingAddress?.address, setActiveStep]);

  const handleInputChange = (field, value) => {
    if (field === "paymentMethod") {
      setSelectedMethod(value);
    }
    setOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // File upload/download handlers unchanged...
  const handleFileChange = (e) => {
    e.preventDefault();
    setSelectedFile(e.target.files[0]);
    setNewFile(true);
  };

  const handleFileDownload = async (e) => {
    e.preventDefault();
    if (!order.fileId) return;
    const resp = await fetch(`/api/orders/uploadPO?fileId=${order.fileId}`);
    if (!resp.ok) return console.error("Failed to download file");
    const blob = await resp.blob();
    const cd = resp.headers.get("Content-Disposition") || "";
    const match = cd.match(/filename="(.+)"/);
    const filename = match ? match[1] : "download";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setNewFile(false);

    try {
      const ext = selectedFile.name.split(".").pop();
      const newFileName = `PO-${order.poNumber}-${customer.companyName}.${ext}`;
      const renamedFile = new File([selectedFile], newFileName, {
        type: selectedFile.type,
      });

      const formData = new FormData();
      formData.append("file", renamedFile);
      formData.append("order", JSON.stringify(order));

      const response = await fetch("/api/orders/uploadPO", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");

      setOrder((cur) => ({
        ...cur,
        ...data.order,
        fileId: data.order.fileId,
        fileName: data.order.fileName,
      }));
      fetchOrder();
      setSelectedFile(null);
      showStatusMessage("success", "P.O. document uploaded");
    } catch (err) {
      console.error("Upload Error:", err);
      showStatusMessage("error", err.message);
    }
  };

  // ── MERGED submit handler ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!order.paymentMethod) {
      return toast.error("Please select a payment method");
    }

    // 2) Persist (create/update) the order
    try {
      const { data } = await axios.post("/api/orders", { order });
      const saved = data.order;

      // 3) Store only the order ID in a cookie
      Cookies.set("orderId", saved._id);
      setOrder(saved);

      // 4) Update local order state
      setOrder(saved);
      showStatusMessage("success", "Order saved successfully");
      fetchOrder();
      // 5) Move to the next step
      setActiveStep(3);
    } catch (err) {
      console.error("Error saving order:", err);
      showStatusMessage("error", "Failed to save order");
    }
  };

  return (
    <>
      <div className='mx-auto max-w-2xl'>
        <h1 className='text-3xl font-bold text-center text-[#144e8b] mb-6'>
          Select a Payment Method
        </h1>
        <div className='mx-auto max-w-lg bg-white shadow-lg rounded-2xl p-6 my-5'>
          <div className='p-3 bg-gray-100 border-l-4 border-[#03793d] rounded-lg flex flex-col md:justify-between'>
            <div className='grid grid-cols-1 bg-white p-2 rounded-md sm:grid-cols-2 gap-4 '>
              <p className='text-gray-600 text-center mb-6 md:col-span-2'>
                Get a <span className='font-bold'>1.5% discount</span> when you
                pay via bank wire transfer.
              </p>

              {/* use handleSubmit on the form */}
              <div className='space-y-4  md:col-span-2'>
                {["Stripe", "Paypal", "Pay by Wire"].map((method) => (
                  <label
                    key={method}
                    htmlFor={method}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${
                      selectedMethod === method
                        ? "border-[#03793d] bg-green-50 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className='flex items-center space-x-4'>
                      <input
                        name='paymentMethod'
                        id={method}
                        type='radio'
                        className='hidden'
                        checked={order.paymentMethod === method}
                        onChange={() =>
                          handleInputChange("paymentMethod", method)
                        }
                      />
                      <div
                        className={`w-5 h-5 flex items-center justify-center border-2 rounded-full transition-all ${
                          selectedMethod === method
                            ? "border-[#03793d] bg-[#03793d]"
                            : "border-gray-400"
                        }`}
                      >
                        {selectedMethod === method && (
                          <div className='w-2.5 h-2.5 bg-white rounded-full' />
                        )}
                      </div>
                      <span className='text-lg font-medium text-gray-800'>
                        {method === "Stripe"
                          ? "Credit Card (Powered by Stripe)"
                          : method}
                      </span>
                    </div>
                  </label>
                ))}

                {order.defaultTerm && (
                  <label
                    htmlFor='PO Number'
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all shadow-sm ${
                      selectedMethod === "PO Number"
                        ? "border-[#03793d] bg-green-50 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className='flex items-center space-x-4'>
                      <input
                        name='paymentMethod'
                        id='PO Number'
                        type='radio'
                        className='hidden'
                        checked={order.paymentMethod === "PO Number"}
                        onChange={() =>
                          handleInputChange("paymentMethod", "PO Number")
                        }
                      />
                      <div
                        className={`w-5 h-5 flex items-center justify-center border-2 rounded-full transition-all ${
                          selectedMethod === "PO Number"
                            ? "border-[#03793d] bg-[#03793d]"
                            : "border-gray-400"
                        }`}
                      >
                        {selectedMethod === "PO Number" && (
                          <div className='w-2.5 h-2.5 bg-white rounded-full' />
                        )}
                      </div>
                      <span className='text-lg font-medium text-gray-800'>
                        PO Number with Terms
                      </span>
                    </div>
                  </label>
                )}

                {selectedMethod === "PO Number" && order.defaultTerm && (
                  <>
                    <div className='md:mb-4'>
                      <label htmlFor='poNumber' className='block mb-2'>
                        Purchase Order #:{" "}
                        <span className='text-xs italic'>
                          Your Terms {order.defaultTerm}
                        </span>
                      </label>
                      <input
                        id='poNumber'
                        type='text'
                        className='w-full px-3 py-2 text-sm text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline h-[2.5rem]'
                        value={order.poNumber || ""}
                        onChange={(e) =>
                          handleInputChange("poNumber", e.target.value)
                        }
                      />
                    </div>

                    <div className='md:mb-4'>
                      <div className='flex justify-between mb-2'>
                        <span>Upload P.O.:</span>
                        {order.fileId && (
                          <span className='text-xs text-gray-400 italic'>
                            Doc: {order.fileName}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2 mt-2'>
                        <input
                          id='uploadDoc'
                          type='file'
                          className='w-full px-3 py-2 text-sm text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline h-[2.5rem]'
                          onChange={handleFileChange}
                        />
                        {selectedFile ? (
                          <button
                            type='button'
                            onClick={handleFileUpload}
                            className='primary-button h-10'
                          >
                            {newFile ? "Upload" : "Uploading..."}
                          </button>
                        ) : order.fileId ? (
                          <button
                            type='button'
                            onClick={handleFileDownload}
                            className='primary-button h-10'
                          >
                            Download
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className='mt-6 flex px-6 justify-between'>
            <button
              type='button'
              className='px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition-all'
              onClick={() => setActiveStep(1)}
            >
              Back
            </button>
            <button
              type='button'
              onClick={(e) => handleSubmit(e)}
              className='px-6 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition-all'
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
