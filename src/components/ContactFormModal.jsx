import React, { useState } from "react";
import { X, Send, Mail, User, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";

const ContactFormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceId =
        import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
      const templateId =
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
      const publicKey =
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          reply_to: formData.email,
          message: formData.message,
          to_email:
            import.meta.env.VITE_EMAILJS_RECEIVER_EMAIL ||
            "annifind010@gmail.com",
        },
        publicKey
      );

      toast.success("Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-support-title"
    >
      <div className="relative w-full max-w-md bg-[#141518] border border-[#2B2E36] rounded-[4px] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact dialog"
          className="absolute top-4 right-4 p-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors rounded-[4px] hover:bg-[#1C1E23]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 border-b border-[#22242A]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-[#17181B] border border-[#2B2E36] rounded-[4px] flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#DAFA9C]" />
            </div>
            <h2
              id="contact-support-title"
              className="text-lg font-semibold text-[#F4F4F0]"
            >
              Contact Support
            </h2>
          </div>
          <p className="text-xs text-[#A8ADB6]">
            Questions, billing requests, or repository feedback — we reply as quickly as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C929C]" />
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Alex Rivera"
                className="w-full bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] py-2.5 pl-10 pr-4 text-xs text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C929C]" />
              <input
                type="email"
                id="contact-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="alex@example.com"
                className="w-full bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] py-2.5 pl-10 pr-4 text-xs text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#8C929C]" />
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe your question or issue..."
                className="w-full bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] py-2.5 pl-10 pr-4 text-xs text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0F0F0F]/30 border-t-[#0F0F0F] rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
