import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/main/Layout";
import axios from "axios";
import { useModalContext } from "../components/context/ModalContext";
import { messageManagement } from "../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../utils/alertSystem/documentRelatedEmail";

export default function ForgotPassword() {
  const router = useRouter();
  const { showStatusMessage, startLoading, stopLoading } = useModalContext();

  const [email, setEmail] = useState("");

  useEffect(() => {
    const { email: emailFromQuery } = router.query;
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [router.query]);

  const handleRequestCode = async () => {
    try {
      startLoading();
      const response = await axios.post("/api/auth/requestResetCode", {
        email: email.trim(),
      });

      console.log("Response from requestResetCode:", response.data);

      const userToUpdate = response.data.user;
      const resetCode = response.data.resetCode;

      const contactToEmail = {
        name: userToUpdate.firstName,
        email: userToUpdate.email,
      };

      const accountOwner = {
        name: "Sofía Gómez",
        email: "sofi@statsurgicalsupply.com",
        charge: "IT Assistant",
        phone: "8132520727",
      };

      const emailmessage = messageManagement(
        contactToEmail,
        "Forgot Password",
        resetCode,
        null,
        null,
        accountOwner
      );

      handleSendEmails(emailmessage, contactToEmail, accountOwner);

      showStatusMessage(
        "success",
        "If we find your email, a reset code has been sent to it. Please check your inbox."
      );
      router.push("/");
    } catch (error) {
      showStatusMessage(
        "error",
        error.response?.data?.message || "Failed to send reset code"
      );
    } finally {
      stopLoading();
    }
  };

  return (
    <Layout
      title='Forgot Password | STAT Surgical Supply'
      description='Recover access to your STAT Surgical Supply account by requesting a password reset code. Enter your registered email to receive instructions for resetting your password securely.'
      schema={[]}
    >
      <div className='max-w-md mx-auto p-6 border rounded shadow mt-10'>
        <h1 className='text-2xl font-bold mb-4'>Reset Your Password</h1>
        <p className='mb-2'>Enter your email to receive reset instructions:</p>

        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='you@example.com'
          className='w-full px-3 py-2 mb-4 border rounded focus:outline-none focus:ring'
        />

        <button
          className='primary-button w-full'
          onClick={handleRequestCode}
          disabled={!email.trim()}
        >
          Recover Access
        </button>
      </div>
    </Layout>
  );
}
