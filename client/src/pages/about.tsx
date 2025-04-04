import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SignupModal from "@/components/auth/signup-modal";
import LoginModal from "@/components/auth/login-modal";
import { ShoppingBag, BookOpen, Users, Recycle, MessageCircle, GraduationCap } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">About UniMarket</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A student-centered marketplace designed to help university students buy and sell unused or unneeded goods within their campus community.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="mb-16">
        <div className="bg-gradient-to-l from-primary to-indigo-800 text-white rounded-xl p-8 md:p-12">
          <div className="md:flex md:items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Our Mission</h2>
              <p className="mb-6">
                UniMarket aims to create a sustainable, affordable, and trustworthy marketplace that connects university students, reducing waste and helping students save money through reuse of quality items.
              </p>
              <h2 className="text-xl md:text-2xl font-bold mb-4">Our Vision</h2>
              <p>
                To be the go-to platform for university students to find affordable goods, reduce their environmental footprint, and create a stronger sense of community on campus.
              </p>
            </div>
            <div className="md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                alt="Students at university" 
                className="rounded-lg shadow-lg h-48 md:h-64 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>



      {/* Features */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">What Makes UniMarket Special</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Campus-Specific Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                UniMarket focuses exclusively on university students, ensuring all listings are relevant to campus life.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <ShoppingBag className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure Bidding System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our built-in bidding feature allows fair price negotiations between buyers and sellers.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Bulk Selling for Graduates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Graduating students can sell multiple items at once with our special bulk selling feature.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <MessageCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Direct Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect directly with sellers through our in-app messaging or WhatsApp integration.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Anonymous Selling Option</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Privacy-focused features allow students to list items anonymously if preferred.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Recycle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Sustainability Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Each transaction on UniMarket helps reduce waste and promotes sustainable consumption.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Our Story */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
            <CardDescription>How UniMarket came to be</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              UniMarket was born from a simple observation: at the end of each semester, university dorms and apartments would fill with perfectly good items that students were throwing away simply because they couldn't bring them home or didn't need them anymore.
            </p>
            <p className="mb-4">
              At the same time, new students were spending hundreds of dollars buying these same items brand new. We saw an opportunity to create a specialized marketplace that would solve both problems while building a more sustainable and affordable campus environment.
            </p>
            <p>
              Built by students for students, UniMarket understands the unique needs of university life. From textbooks that are only needed for one semester to dorm furniture that doesn't fit in your car when you go home for summer break, our platform is designed to keep these items in circulation and out of landfills.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Join the UniMarket Community?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Whether you're looking to declutter your dorm room or find affordable textbooks, UniMarket is here to help you connect with fellow students.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => window.location.href = "/"}>Browse Listings</Button>
          <Button variant="outline" size="lg" onClick={() => setIsSignupModalOpen(true)}>Create Account</Button>
        </div>

        <SignupModal 
          isOpen={isSignupModalOpen} 
          onClose={() => setIsSignupModalOpen(false)} 
          openLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          openSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
      </div>
    </div>
  );
}
