'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal-800 text-warm-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-playfair font-bold text-sm">1G</span>
              </div>
              <span className="font-playfair text-lg font-semibold">1-Group Cuisine</span>
            </div>
            <p className="text-sm text-warm-300">
              Professional culinary platform for Singapore's 1-Group hospitality portfolio.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recipes" className="hover:text-gold-400 transition-colors">
                  Recipes
                </Link>
              </li>
              <li>
                <Link href="/chefs" className="hover:text-gold-400 transition-colors">
                  Chefs
                </Link>
              </li>
              <li>
                <Link href="/masterclasses" className="hover:text-gold-400 transition-colors">
                  Masterclasses
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-gold-400 transition-colors">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gold-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gold-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gold-400 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-400" />
                <a href="mailto:hello@1groupcuisine.com" className="hover:text-gold-400 transition-colors">
                  hello@1groupcuisine.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-400" />
                <a href="tel:+6561234567" className="hover:text-gold-400 transition-colors">
                  +65 6123 4567
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-gold-400 mt-0.5" />
                <span>Singapore</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-700 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-warm-400">
              © 2024 1-Group Cuisine. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-warm-400 hover:text-gold-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-warm-400 hover:text-gold-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-warm-400 hover:text-gold-400 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
