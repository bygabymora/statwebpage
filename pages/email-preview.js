import React, { useState } from "react";
import DocumentComponent from "../components/mailChimp/document/Component";
import { messageManagement } from "../utils/alertSystem/customers/messageManagement";
import ContactTemplate from "../components/mailChimp/ContactTemplate";
import SignatureTemplate from "../components/mailChimp/document/Signatures";

const cases = [
  "Register",
  "Contact Us",
  "Product Wait List",
  "Product Request",
  "Order Confirmation",
  "Order Shipped",
  "Product Manufacturer",
  "Newsletter Subscription",
];

// Single contact and order for all cases
const sampleContact = {
  name: "Jane Smith",
  email: "jane@example.com",
};

const sampleItem = {
  name: "EGIA45AVM",
  manufacturer: "EGIA",
};

const sampleStatRep = {
  name: "Gabriela Mora",
  email: "gaby@statsurgicalsupply.com",
  phone: "3195535000",
  charge: "Sales Rep.",
};

const sampleOrder = {
  _id: "6823c7f6fb287a50a02ca71c",
  wpUser: {
    userId: "681d43194e20b8c06a41df42",
    firstName: "Gabriela",
    lastName: "Mora",
    email: "bygabymora@gmail.com",
  },
  orderItems: [
    {
      name: "EGIA45AVM",
      productId: "66bce6b29b75f9791cfb8995",
      price: 10,
      quantity: 3,
      typeOfPurchase: "each",
      image:
        "https://res.cloudinary.com/dcjahs0jp/image/upload/v1731719158/thkiwlotmfiw2qojoqlt.png",
      sentOverNight: false,
      quickBooksItemIdProduction: "143",
      unitPrice: 10,
      _id: "68099464a93d8100b3f501a0",
    },
    {
      name: "EGIA60AVM",
      productId: "66be84fc6593060f37c43fa7",
      price: 5,
      quantity: 3,
      typeOfPurchase: "each",
      image:
        "https://res.cloudinary.com/dcjahs0jp/image/upload/v1731719248/ve0pfkcofktntqd7yvyi.png",
      sentOverNight: false,
      quickBooksItemIdProduction: "141",
      unitPrice: 5,
      _id: "68099474a93d8100b3f501a1",
    },
  ],
  docNumber: "1113",
  shippingAddress: {
    contactInfo: {
      firstName: "Gabriela",
      lastName: "Mora",
      email: "bygabymora@gmail.com",
    },
    companyName: "ABC Surgi Center",
    phone: "+13195535000",
    address: "100 Ashley Drive South",
    state: "FL",
    city: "Tampa",
    postalCode: "33602",
    suiteNumber: "600",
    notes: "",
  },
  billingAddress: {
    contactInfo: {
      firstName: "Gabriela",
      lastName: "Mora",
      email: "bygabymora@gmail.com",
    },
    companyName: "ABC Surgi Center",
    phone: "ABC Surgi Center",
    address: "2512 E Stanley Matthew Cir",
    state: "FL",
    city: "Tampa",
    postalCode: "33604",
  },
  shippingPreferences: {
    shippingMethod: "FedEx Ground",
    carrier: "FedEx",
    account: "201493586",
    paymentMethod: "Bill Me",
  },
  paymentMethod: "Stripe",
  defaultTerm: "Net. 30",
  itemsPrice: 45,
  totalPrice: 57,
  total: "$57",
  isPaid: false,
  isDelivered: false,
  isAtCostumers: false,
  discountAmount: 0,
  status: "Completed",
  paymentId: null,
};

// Messages per case
const sampleMessages = {
  Register: "",
  "Contact Us": "I have an issue with my recent order.",
  "Product Wait List": "",
  "Product Request": "Please let me know when available.",
  "Order Confirmation": "",
  "Order Shipped": "",
  "Product Manufacturer": "",
  "Newsletter Subscription": "",
};

export default function EmailPreview() {
  const [action, setAction] = useState(cases[0]);
  const message = sampleMessages[action];
  const emailMessage = messageManagement(
    sampleContact,
    action,
    message,
    sampleOrder,
    sampleItem
  );
  const html = DocumentComponent({
    message: emailMessage,
    contact: sampleContact,
  });

  const signature = SignatureTemplate({ userInfo: sampleStatRep });
  const finalHtml = ContactTemplate({
    message: html,
    signature: signature,
  });

  return (
    <main className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>
        <header className='mb-6'>
          <h1 className='text-2xl font-semibold mb-4'>
            Email Template Preview
          </h1>
          <div className='flex items-center space-x-3'>
            <label htmlFor='action' className='font-medium'>
              Select Case:
            </label>
            <select
              id='action'
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className='border rounded p-2'
            >
              {cases.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className='bg-white p-4 rounded shadow'>
          <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
        </section>
      </div>
    </main>
  );
}
