import React from "react";
import Layout from "../components/main/Layout";

export default function facs() {
  return (
    <>
      <Layout
        title='Return policy | STAT Surgical Supply'
        description='Read STAT Surgical Supply return policy for surgical supplies and surgical equipment. Learn about our return process, conditions, and exceptions to ensure a smooth return experience.'
        schema={[]}
      >
        <div className='card p-5 mb-10'>
          <h1 className='section__title'>Return Policy</h1>
          <br />
          <h2 className='section__subtitle'>Last updated October 19, 2023</h2>
          <h3 className='text-gray-500'>
            Thank you for your purchase. We hope you are happy with it.
          </h3>
          <br />
          <p>
            However, if you are dissatisfied with your purchase, you may return
            it to us for store credit only. Please see below for more
            information on our return policy. RETURNS All returns must be
            initiated (14) days from the purchase date. All returned items must
            be in new and unused condition, with all the manufacturer seals
            intact. Temperature and humidity-sensitive items must be returned
            overnight and shipped Monday through Thursday to ensure they arrive
            uncompromised.
          </p>
          <br />
          <h2>RETURN PROCESS</h2>
          <h5>
            To return an item, please email customer service at
            sales@statsurgicalsupply.com for approval and a Return Merchandise
            Authorization (RMA) number. After receiving an RMA number, place the
            item securely in its original packaging and ship your return to the
            following address:
          </h5>
          <br />
          <p className='text-gray-500 font-bold ml-5'>
            Stat Surgical Supply LLC
            <br />
            Attn: Returns RMA#
            <br />
            2501 N. Armenia Avenue Unit 2
            <br />
            Tampa, Florida 33607
            <br />
            United States.
            <br />
          </p>
          <br />
          <p>
            Please note you will be responsible for all return shipping charges.
            We strongly recommend using a trackable method to mail your return,
            like FedEx or UPS.{" "}
          </p>
          <br />
          <h2>RETURN PROCESSING</h2>
          <h5>
            {" "}
            After receiving your return and inspecting the condition of your
            item(s), we will process your return. Please allow at least two (2)
            days from receiving your item to process your return. We will notify
            you by email when your return has been processed.
          </h5>
          <br />
          <p>
            Please Note Items must be in the same condition they were in when
            they were delivered. Please ensure items are packed carefully with
            adequate packing material to protect the products. Any damage,
            compromised sterility, dirty packaging, or writing on an item will
            result in the items being rejected. If an item is rejected, we will
            notify you via email and send the items back to you.
          </p>
          <br />
          <h2>EXCEPTIONS</h2>
          <h5>
            {" "}
            Certain items are not returnable due to their high temperature and
            humidity sensitivity:
          </h5>
          <p className='text-gray-500 font-bold ml-5 mb-10'>
            <br />
            Integra Duraseal
            <br />
            Integra Duragen
            <br />
            Medtronic Bone Grafts
            <br />
          </p>

          <br />
          <h2>QUESTIONS</h2>
          <h5>
            If you have any questions concerning our return policy, please get
            in touch with us at:
          </h5>
          <p className='text-gray-500 font-bold ml-5 mb-10'>
            <br />
            813-252-0727
            <br />
            sales@statsurgicalsupply.com
          </p>
        </div>
      </Layout>
    </>
  );
}
