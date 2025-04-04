import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./layout";
import { AuthProvider } from "./context/auth-context";
import { ProductProvider } from "./context/product-context";

// Pages
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import ProductDetail from "@/pages/product-detail";
import Categories from "@/pages/categories";
import MyListings from "@/pages/my-listings";
import PurchaseHistory from "@/pages/purchase-history";
import Messages from "@/pages/messages";
import NotFound from "@/pages/not-found";
import Sell from "@/pages/sell";
import BulkSales from "@/pages/bulk-sales";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Settings from "@/pages/settings";

function Router() {

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-listings" component={MyListings} />
      <Route path="/purchase-history" component={PurchaseHistory} />
      <Route path="/messages" component={Messages} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:id" component={Categories} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/sell" component={Sell} />
      <Route path="/bulk-sales" component={BulkSales} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </ProductProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
