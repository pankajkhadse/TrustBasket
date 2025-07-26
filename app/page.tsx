"use client"
import { motion } from "framer-motion"
import { ArrowRight, Users, ShoppingCart, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import VegiAnimation from "../components/vegiAnimation";
import VerifyAnimation from "../components/verifyAnimation"
import BasketAnimation from "../components/basketAnimation"


export default function HomePage() {

const features = [
  {
    icon: VerifyAnimation, // ✅ pass the component, not <VerifyAnimation />
    title: "Verified Network",
    description: "Connect with certified suppliers and verified vendors in your area.",
  },
  {
    icon: BasketAnimation,
    title: "Easy Ordering",
    description: "Streamlined ordering process with real-time inventory updates.",
  },
  {
    icon: VerifyAnimation,
    title: "Quality Assured",
    description: "All suppliers are FSSAI certified ensuring food safety standards.",
  },
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-green-600">TrustBasket</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="text-gray-700 hover:text-green-600">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Connect Street Food
                <span className="text-green-600"> Vendors</span> with
                <span className="text-orange-500"> Quality Suppliers</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                TrustBasket is the B2B marketplace that bridges the gap between street food vendors and certified raw
                material sellers, ensuring quality and reliability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=vendor">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                    Join as Vendor
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register?role=seller">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-50 w-full sm:w-auto bg-transparent"
                  >
                    Join as Seller
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-center w-full max-w-md mx-auto">
                {/* <img
                  src="/vegi.jpg?height=400&width=500"
                  alt="TrustBasket Platform"
                  className="w-full h-auto rounded-lg"
                /> */}
                <VegiAnimation/>
              

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose TrustBasket?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive platform that ensures quality, reliability, and growth for both vendors and
              suppliers.
            </p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature, index) => {
    const IconComponent = feature.icon;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
           {IconComponent ? <IconComponent className="w-10 h-10" /> : null}   
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  })}
</div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "500+", label: "Active Vendors" },
              { number: "200+", label: "Certified Suppliers" },
              { number: "10k+", label: "Orders Completed" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-white"
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-green-400 mb-4">TrustBasket</h3>
              <p className="text-gray-300 mb-4">
                Connecting street food vendors with quality suppliers for a better food ecosystem.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-green-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-green-400">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-300 hover:text-green-400">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-green-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-green-400">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 TrustBasket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
