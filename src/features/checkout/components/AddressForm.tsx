'use client';

import { useState } from 'react';
import { MapPin, User, Phone, Building } from 'lucide-react';

export interface AddressData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface AddressFormProps {
  address: AddressData;
  onChange: (address: AddressData) => void;
}

export function AddressForm({ address, onChange }: AddressFormProps) {
  function updateField(field: keyof AddressData, value: string) {
    onChange({ ...address, [field]: value });
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-primary-900 placeholder:text-neutral-500 transition-colors focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20';
  const inputClassNoIcon =
    'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-primary-900 placeholder:text-neutral-500 transition-colors focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-900">Full Name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={address.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              placeholder="John Doe"
              required
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-900">Phone</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="tel"
              value={address.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary-900">Address Line 1</label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={address.address_line1}
            onChange={(e) => updateField('address_line1', e.target.value)}
            placeholder="123 Main Street"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary-900">
          Address Line 2 <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <div className="relative">
          <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={address.address_line2}
            onChange={(e) => updateField('address_line2', e.target.value)}
            placeholder="Apt 4B"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-900">City</label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="New York"
            required
            className={inputClassNoIcon}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-900">State</label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="NY"
            required
            className={inputClassNoIcon}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-900">Postal Code</label>
          <input
            type="text"
            value={address.postal_code}
            onChange={(e) => updateField('postal_code', e.target.value)}
            placeholder="10001"
            required
            className={inputClassNoIcon}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary-900">Country</label>
        <input
          type="text"
          value={address.country}
          onChange={(e) => updateField('country', e.target.value)}
          placeholder="United States"
          required
          className={inputClassNoIcon}
        />
      </div>
    </div>
  );
}
