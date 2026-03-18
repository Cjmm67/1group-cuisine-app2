'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-24">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">1G</span>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">1-Group Cuisine</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Professional culinary platform for Singapore's 1-Group hospitality portfolio.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/recipes" className="text-gray-400 hover:text-gold-400 transition-colors">Recipes</Link></li>
              <li><Link href="/chefs" className="text-gray-400 hover:text-gold-400 transition-colors">Chefs</Link></li>
              <li><Link href="/masterclasses" className="text-gray-400 hover:text-gold-400 transition-colors">Masterclasses</Link></li>
              <li><Link href="/marketplace" className="text-gray-400 hover:text-gold-400 transition-colors">Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-gold-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-gold-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-gold-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-gold-400 transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-gold-500" />
                <a href="mailto:hello@1groupcuisine.com" className="text-gray-400 hover:text-gold-400 transition-colors">
                  hello@1groupcuisine.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-gold-500" />
                <a href="tel:+6561234567" className="text-gray-400 hover:text-gold-400 transition-colors">
                  +65 6123 4567
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-gold-500 mt-0.5" />
                <span className="text-gray-400">Singapore</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2024 1-Group Cuisine. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="#" className="hover:text-gold-400 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-gold-400 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
