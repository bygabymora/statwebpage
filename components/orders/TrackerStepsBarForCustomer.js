// components/TrackerStepsBar.js
import Link from "next/link";
import React from "react";
import { FaSearchLocation } from "react-icons/fa";
import { FaCrown, FaEye, FaEyeSlash } from "react-icons/fa6";
import formatDateWithTimeForInput from "../../utils/dateWithTimeUtils";

const warningStatuses = ["return_to_sender", "failure", "cancelled", "error"];

// Map valid statuses to a step index (0-3).
// Both "delivered" and "available_for_pickup" map to the final step (3).
const statusToIndex = {
  pre_transit: 0,
  in_transit: 1,
  out_for_delivery: 2,
  delivered: 3,
  available_for_pickup: 3,
};

// Label each of the 4 steps
function getStepLabel(index, trackerStatus) {
  switch (index) {
    case 0:
      return "Pre Transit";
    case 1:
      return "In Transit";
    case 2:
      return "Out for Delivery";
    case 3:
      // Dynamically label the final step
      return trackerStatus === "available_for_pickup"
        ? "Available for Pickup"
        : "Delivered";
    default:
      return "";
  }
}

const TrackerStepsBarForCustomer = ({
  shipping,
  setShowShippingId,
  showShippingId,
  groupName,
}) => {
  // 4) Render exactly 4 steps in a row
  const totalSteps = 4; // step indices: 0..3
  const finalStatus = (parcel) => {
    if (
      (parcel.trackerStatus === "unknown" || !parcel.trackerStatus) &&
      parcel.deliveryEstimatedDate
    ) {
      return "pre_transit";
    } else {
      return parcel.trackerStatus;
    }
  };

  return (
    <>
      {shipping?.parcels?.length > 0 &&
        shipping?.parcels.map((parcel, index) => (
          <div
            className='flex flex-col items-center justify-center w-full p-4 bg-white rounded-md'
            key={index}
          >
            <div className='flex flex-col gap-2 items-center w-full  text-center justify-between p-2 my-1'>
              <div className='flex justify-between gap-5 w-full max-w-4xl'>
                <div className='font-bold flex items-center gap-2'>
                  {shipping?.paymentMethod} - {shipping?.shippingMethod}{" "}
                  {parcel?.isMaster && <FaCrown />}
                </div>
                <div className=''>
                  {shipping?.paymentMethod === "UPS" && (
                    <Link
                      href={`https://www.ups.com/track?loc=en_US&tracknum=${parcel.trackingNumber}`}
                      target='_blank'
                    >
                      <div className='justify-center items-end flex relative '>
                        <div className='primary-button text-xs text-center'>
                          <FaSearchLocation />
                        </div>
                      </div>
                    </Link>
                  )}
                  {shipping?.paymentMethod === "FedEx" && (
                    <Link
                      href={`https://www.fedex.com/fedextrack/?trknbr=${parcel.trackingNumber}`}
                      target='_blank'
                    >
                      <div className='justify-center items-end flex relative '>
                        <div className='primary-button text-xs text-center'>
                          <FaSearchLocation />
                        </div>
                      </div>
                    </Link>
                  )}
                  {shipping?.paymentMethod === "Other" && (
                    <Link
                      href={`https://www.google.com/search?q=${parcel.trackingNumber}`}
                      target='_blank'
                    >
                      <div className='justify-center items-end flex relative'>
                        <div className='primary-button text-xs text-center'>
                          <FaSearchLocation />
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <div>{parcel.trackingNumber}</div>
                <button
                  data-ignore-context
                  type='button'
                  onClick={() => {
                    setShowShippingId(
                      showShippingId === parcel._id ? -1 : parcel._id
                    );
                  }}
                  className='text-[var(--text-color)] text-xl flex items-center justify-center'
                >
                  {showShippingId === parcel._id ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {statusToIndex[finalStatus(parcel)] === -1 &&
            groupName === "Group2" ? (
              <div className='p-4 bg-white rounded-md text-center text-[#144e8b] font-semibold'>
                Unknown Status
              </div>
            ) : !warningStatuses.includes(parcel.trackerStatus) ? (
              <div className='flex items-center justify-between w-full max-w-4xl'>
                {Array.from({ length: totalSteps }).map((_, index) => {
                  const isCompleted =
                    index <= statusToIndex[finalStatus(parcel)];

                  return (
                    <React.Fragment key={index}>
                      {/* Step (circle + label) */}

                      <div className='flex flex-col items-center'>
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-4 ${
                            isCompleted ? "bg-[#05a6ed]" : "bg-white"
                          } border-[#144e8b] font-bold`}
                        ></div>
                      </div>

                      {/* Connecting line (except after the last step) */}
                      {index < totalSteps - 1 && (
                        <div
                          className='flex-1 h-1 mx-2 self-center'
                          style={{
                            backgroundColor:
                              index < statusToIndex[finalStatus(parcel)]
                                ? "#05a6ed"
                                : "#5a6f81",
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className='p-4 bg-[#5a6f81] text-white rounded-md text-center font-semibold'>
                🟥 Warning: Shipment encountered an issue (
                {parcel.trackerStatus})
              </div>
            )}
            <div className='flex items-center justify-between w-full max-w-4xl'>
              {Array.from({ length: totalSteps }).map((_, index) => {
                return (
                  <React.Fragment key={index}>
                    <div className='flex flex-col items-center'>
                      <div className='mt-2 text-xs font-semibold text-[#144e8b]'>
                        {getStepLabel(index, finalStatus(parcel))}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {showShippingId === parcel._id && (
              <div className='flex flex-col items-center justify-between w-full max-w-4xl'>
                {shipping.trackerDetails?.length > 0 ? (
                  <div className='flex flex-col items-center mt-2'>
                    {shipping.trackerDetails
                      .slice()
                      .reverse()
                      .map((detail, index) => (
                        <div key={index} className='text-xs border p-1 w-full'>
                          <div className='text-left font-semibold'>
                            {formatDateWithTimeForInput(detail.datetime)}
                          </div>
                          <div className='text-left'>{detail.message}</div>
                          {detail.tracking_location?.city && (
                            <div className='text-left'>
                              {detail.tracking_location.city},{" "}
                              {detail.tracking_location.state}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className='p-4 bg-white rounded-md text-center text-[#144e8b] font-semibold'>
                    No tracking details available yet.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </>
  );
};

export default TrackerStepsBarForCustomer;
