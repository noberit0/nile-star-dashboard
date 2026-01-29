'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Bus,
  Route,
  Ticket,
  CreditCard,
  Users,
  Settings,
  Calendar,
  Package,
  Search,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I add a new bus to my fleet?',
    answer: 'Navigate to Bus Units from the sidebar, then click the "Add Bus" button. Fill in the required information including registration number, capacity, and type. You can also configure luggage pricing and features for each bus.',
  },
  {
    category: 'Getting Started',
    question: 'How do I create a new route?',
    answer: 'Go to Routes from the sidebar and click "Add Route". Enter the origin, destination, base fare, and estimated duration. You can also add intermediate stops with their own fares and timing.',
  },
  {
    category: 'Bookings',
    question: 'How do I view and manage customer bookings?',
    answer: 'Access the Bookings page from the sidebar to see all reservations. You can filter by date, status, or route. Click on any booking to view details, process refunds, or update the booking status.',
  },
  {
    category: 'Bookings',
    question: 'How do I process a refund for a cancelled booking?',
    answer: 'Go to the Refunds page or find the booking in the Bookings section. Select the booking and click "Process Refund". Choose between full or partial refund, add a reason, and confirm. The customer will be notified automatically.',
  },
  {
    category: 'Schedules',
    question: 'How do I set up recurring schedules?',
    answer: 'From the Routes page, select a route and click "Manage Schedules". You can create schedules with specific departure times and assign buses. Set the days of operation and the schedule will automatically repeat.',
  },
  {
    category: 'Schedules',
    question: 'Can I modify a schedule after it\'s created?',
    answer: 'Yes, you can edit schedules at any time. Navigate to the route, find the schedule, and click edit. Note that changes won\'t affect bookings already made for past dates.',
  },
  {
    category: 'Finance',
    question: 'How do I track my revenue and earnings?',
    answer: 'The Finance page provides a comprehensive overview of your earnings. View daily, weekly, or monthly reports. Track completed trips, pending payments, and withdrawal history.',
  },
  {
    category: 'Finance',
    question: 'When do I receive payments for bookings?',
    answer: 'Payments are processed after trip completion. Funds are typically available for withdrawal within 24-48 hours after a successful trip. Check your Finance page for pending and available balances.',
  },
  {
    category: 'Buses',
    question: 'How do I set up extra luggage pricing?',
    answer: 'When adding or editing a bus, scroll to the Luggage Configuration section. Set the price per extra luggage item and the maximum number of items allowed. This will be shown to customers during booking.',
  },
  {
    category: 'Buses',
    question: 'How do I mark a bus as unavailable for maintenance?',
    answer: 'Edit the bus from the Bus Units page and change the status to "Maintenance" or set the active toggle to off. This will prevent the bus from being assigned to new schedules.',
  },
];

const categories = [
  { id: 'all', label: 'All Topics', icon: Book },
  { id: 'Getting Started', label: 'Getting Started', icon: HelpCircle },
  { id: 'Bookings', label: 'Bookings', icon: Ticket },
  { id: 'Schedules', label: 'Schedules', icon: Calendar },
  { id: 'Finance', label: 'Finance', icon: CreditCard },
  { id: 'Buses', label: 'Buses', icon: Bus },
];

const quickLinks = [
  { title: 'Managing Routes', description: 'Learn how to create and manage your routes', icon: Route, href: '/dashboard/routes' },
  { title: 'Bus Fleet', description: 'Add and configure your bus fleet', icon: Bus, href: '/dashboard/buses' },
  { title: 'View Bookings', description: 'Track and manage customer bookings', icon: Ticket, href: '/dashboard/bookings' },
  { title: 'Account Settings', description: 'Update your profile and preferences', icon: Settings, href: '/dashboard/settings' },
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs = faqData.filter((faq) => {
    return selectedCategory === 'all' || faq.category === selectedCategory;
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-[#8a6ae8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
            <p className="text-sm text-gray-500">Find answers and get support</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <a
              key={index}
              href={link.href}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center mb-4 group-hover:bg-[#8a6ae8] transition-colors duration-300">
                <Icon className="w-5 h-5 text-[#8a6ae8] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{link.title}</h3>
              <p className="text-xs text-gray-500">{link.description}</p>
              <div className="flex items-center gap-1 mt-3 text-[#8a6ae8] text-xs font-medium">
                <span>Go to page</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </a>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-[500px]">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#8a6ae8] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <Book className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Frequently Asked Questions</h3>
                  <p className="text-xs text-gray-500">
                    {filteredFAQs.length} {filteredFAQs.length === 1 ? 'topic' : 'topics'} found
                  </p>
                </div>
              </div>
            </div>

            {filteredFAQs.length === 0 ? (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No results found</h4>
                <p className="text-sm text-gray-500">Try adjusting your filter</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="p-0">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <span className="px-2.5 py-1 bg-[#8a6ae8]/10 text-[#8a6ae8] text-xs font-semibold rounded-lg flex-shrink-0">
                          {faq.category}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                          expandedFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 pb-6">
                        <div className="ml-[100px] p-4 bg-gradient-to-br from-[#8a6ae8]/5 to-[#67e8f9]/5 rounded-2xl border border-[#8a6ae8]/10">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-[#8a6ae8] to-[#6b4fcf] rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Still need help?</h3>
              <p className="text-sm text-white/80">Our support team is here to assist you</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/20 rounded-full border border-white/30">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">support@nilestarcoaches.com</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/20 rounded-full border border-white/30">
              <Phone className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">+256 752 483 921</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-full bg-[#67e8f9]/20 flex items-center justify-center mb-4">
            <Book className="w-5 h-5 text-cyan-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Documentation</h3>
          <p className="text-xs text-gray-500 mb-4">
            Detailed guides and tutorials for all features
          </p>
          <button className="flex items-center gap-1 text-[#8a6ae8] text-xs font-medium hover:underline">
            <span>View docs</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-full bg-[#c4f464]/30 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-lime-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Community</h3>
          <p className="text-xs text-gray-500 mb-4">
            Connect with other operators and share tips
          </p>
          <button className="flex items-center gap-1 text-[#8a6ae8] text-xs font-medium hover:underline">
            <span>Join community</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center mb-4">
            <Package className="w-5 h-5 text-[#8a6ae8]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">What&apos;s New</h3>
          <p className="text-xs text-gray-500 mb-4">
            Latest updates and feature announcements
          </p>
          <button className="flex items-center gap-1 text-[#8a6ae8] text-xs font-medium hover:underline">
            <span>See updates</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
