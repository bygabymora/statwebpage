import React from 'react';
import Layout from '../components/Layout';

export default function facs() {
  return (
    <>
      <Layout title="FAQS">
        <div className="card p-5 mb-10">
          <h1 className="mb-4 text-xl">Terms and Conditions</h1>
          <h2>Quality Control Policy</h2>
          <p>
            Stat Surgical puts quality control above everything else. All
            devices go through a thorough quality control process. Any damaged
            device, expired, compromised sterility, or dirty/yellow packaging
            will not pass quality control.
          </p>
          <br />
          <h2>Storage of Devices</h2>
          <p>
            {' '}
            Devices are stored in a clean and temperature/humidity-controlled
            environment.
          </p>
          <br />
          <h2>Returns and Warranty</h2>
          <p>
            Stat Surgical warranties devices from when they leave our warehouse
            until 48 hours after they arrive at their destination.
          </p>
          <br />
          <h2>Shipping Policies and Procedures</h2>
          <p>
            Stat Surgical ships via FedEx and UPS to all fifty states. Please
            let your representative know if you want to use your FedEx or UPS
            account, and we will bill your account. If you want us to ship on
            our account, please know that all charges must be paid before the
            order is released.
          </p>
        </div>
      </Layout>
    </>
  );
}
