"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Thank you for contacting us! We will get back to you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground mt-1 font-light">Have questions about card customizability or orders? Get in touch!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Store Information</CardTitle>
                <CardDescription>Muki Crafty Cards Support Hub</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2 text-sm font-light">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Email Support</span>
                    <a href="mailto:support@mukicraftycards.com" className="text-muted-foreground hover:text-primary transition-colors">
                      support@mukicraftycards.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Phone Support</span>
                    <span className="text-muted-foreground">+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Office Address</span>
                    <p className="text-muted-foreground leading-relaxed">
                      Gandhigram Rural Institute,<br />
                      Gandhigram, Dindigul,<br />
                      Tamil Nadu - 624302, India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Send a Message</CardTitle>
              <CardDescription>Fill out the form below and our team will reply within 24 hours</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor="contact-name">Your Name</label>
                    <Input
                      id="contact-name"
                      placeholder="Pandi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor="contact-email">Email Address</label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="pandi@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" htmlFor="contact-subject">Subject</label>
                  <Input
                    id="contact-subject"
                    placeholder="E.g., Custom bulk card printing options"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" htmlFor="contact-msg">Message</label>
                  <Textarea
                    id="contact-msg"
                    rows={5}
                    placeholder="Enter details of your query..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4 border-t border-border">
                <Button type="submit" disabled={loading} className="flex items-center gap-1.5">
                  <Send className="h-4 w-4" /> {loading ? "Sending..." : "Submit Message"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
