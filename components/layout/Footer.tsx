'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-24">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">1G</span>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">1-CUISINESG</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              1-Group is Singapore&apos;s leading premium hospitality group, operating 24 award-winning restaurants, rooftop bars, and event venues across Singapore and Malaysia. Founded in 2006, 1-Group creates extraordinary dining experiences in landmark locations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/recipes" className="text-gray-400 hover:text-gold-400 transition-colors">Recipes</Link></li>
              <li><Link href="/chefs" className="text-gray-400 hover:text-gold-400 transition-colors">Chefs</Link></li>
              <li><Link href="/masterclasses" className="text-gray-400 hover:text-gold-400 transition-colors">1-Cheflix</Link></li>
              <li><Link href="/marketplace" className="text-gray-400 hover:text-gold-400 transition-colors">Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">1-Group Venues</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="https://www.1-group.sg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">1-Altitude — Rooftop Bar, Level 63</a></li>
              <li><a href="https://kaarla-oumi.sg/kaarla/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">Kaarla — Modern Australian</a></li>
              <li><a href="https://kaarla-oumi.sg/oumi/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">Oumi — Japanese Omakase</a></li>
              <li><a href="https://www.monti.sg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">MONTI — Italian</a></li>
              <li><a href="https://www.una.sg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">UNA — Spanish at Alkaff Mansion</a></li>
              <li><a href="https://firerestaurant.sg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">Fire Restaurant — Argentine</a></li>
              <li><a href="https://www.flnt.sg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">FLNT — Nikkei</a></li>
              <li><a href="https://www.1-group.sg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">La Torre</a></li>
              <li><a href="https://www.1-group.sg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">La Luna</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-gold-500" />
                <a href="mailto:hello@1-group.sg" className="text-gray-400 hover:text-gold-400 transition-colors">
                  hello@1-group.sg
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-gold-500 mt-0.5" />
                <span className="text-gray-400">One Raffles Place, Singapore 048616</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2026 1-CUISINESG by 1-Group Singapore. All rights reserved.
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
