"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PencilIcon } from "@/icons";
import { useModal } from "@/hooks/useModal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useAdminProfile } from "@/context/ProfileContext";
import { toast } from "sonner";

export default function UserMetaCard() {
  const { profile, updateProfile, isSaving } = useAdminProfile();
  const { isOpen, openModal, closeModal } = useModal();

  // Local Form state for edit modal
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [role, setRole] = useState(profile.role);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [facebook, setFacebook] = useState(profile.facebook);
  const [twitter, setTwitter] = useState(profile.twitter);
  const [linkedin, setLinkedin] = useState(profile.linkedin);
  const [instagram, setInstagram] = useState(profile.instagram);
  const [isUploading, setIsUploading] = useState(false);

  // Sync modal form when profile updates or modal opens
  useEffect(() => {
    if (isOpen) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setRole(profile.role);
      setEmail(profile.email);
      setPhone(profile.phone);
      setBio(profile.bio);
      setLocation(profile.location);
      setAvatarUrl(profile.avatarUrl);
      setFacebook(profile.facebook);
      setTwitter(profile.twitter);
      setLinkedin(profile.linkedin);
      setInstagram(profile.instagram);
    }
  }, [isOpen, profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAvatarUrl(data.url);
        // Persist immediately to database & localStorage
        await updateProfile({ avatarUrl: data.url });
        toast.success("Profile picture updated & saved!");
        return;
      }
    } catch (err) {
      console.warn("Avatar upload failed, falling back to data URL:", err);
    } finally {
      setIsUploading(false);
    }

    // Fallback data URL
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        await updateProfile({ avatarUrl: reader.result });
        toast.success("Profile picture updated & saved!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First Name and Last Name are required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const success = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      location: location.trim(),
      avatarUrl,
      facebook: facebook.trim(),
      twitter: twitter.trim(),
      linkedin: linkedin.trim(),
      instagram: instagram.trim(),
    });

    if (success) {
      toast.success("Profile updated successfully!");
      closeModal();
    } else {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const displayName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <div className="flex flex-col gap-5 sm:flex-row xl:gap-10">
          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-5 sm:flex-row lg:mb-6 xl:items-center xl:justify-between">
              <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center lg:gap-6">
                <div
                  suppressHydrationWarning
                  className="relative size-20 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
                >
                  <Image
                    unoptimized
                    src={profile.avatarUrl || "/images/user/owner.png"}
                    width={80}
                    height={80}
                    className="h-full w-full rounded-full object-cover"
                    alt={displayName || "SuperBarrio Admin"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/user/owner.png";
                    }}
                    priority
                  />
                </div>
                <div className="text-start">
                  <h4 className="mb-1 text-xl font-bold text-gray-800 dark:text-white/90">
                    {displayName || "SuperBarrio Admin"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-brand-600 dark:text-brand-400">
                      {profile.role || "Store Manager"}
                    </span>
                    <span className="hidden sm:inline-block h-3.5 w-px bg-gray-300 dark:bg-gray-700"></span>
                    <span>{profile.location || "Madrid, España"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-11 xl:gap-y-7">
              <div className="w-full">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  First Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.firstName || "—"}
                </p>
              </div>

              <div className="w-full">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Last Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.lastName || "—"}
                </p>
              </div>

              <div className="hidden xl:block"></div>
              <div className="hidden xl:block"></div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Email Address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.email || "—"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.phone || "—"}
                </p>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Bio / Responsibilities
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {profile.bio || "Store Administrator"}
                </p>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Social Links
                </p>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                  {profile.facebook && (
                    <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition" title="Facebook">
                      <svg className="size-5 fill-current" viewBox="0 0 20 20">
                        <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" />
                      </svg>
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition" title="X / Twitter">
                      <svg className="size-5 fill-current" viewBox="0 0 20 20">
                        <path d="M14.7066 2.60449H17.2158L11.734 8.8699L18.1829 17.3957H13.1334L9.1785 12.2248L4.65318 17.3957H2.14247L8.00586 10.6941L1.81934 2.60449H6.99702L10.5719 7.33085L14.7066 2.60449ZM13.826 15.8938H15.2164L6.24153 4.02748H4.74951L13.826 15.8938Z" />
                      </svg>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition" title="LinkedIn">
                      <svg className="size-5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" />
                      </svg>
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition" title="Instagram">
                      <svg className="size-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={openModal}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <PencilIcon className="size-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="relative no-scrollbar w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
          <div className="mb-6">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Personal Information
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your store manager credentials and contact profile.
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="custom-scrollbar max-h-[550px] overflow-y-auto pr-2 space-y-6">
              {/* Profile Image Picker */}
              <div>
                <Label>Profile Picture</Label>
                <div className="mt-2 flex items-center gap-5">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                    <Image
                      unoptimized
                      src={avatarUrl || "/images/user/owner.png"}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/user/owner.png";
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="avatar-file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition"
                    >
                      <PencilIcon className="size-3.5" />
                      {isUploading ? "Uploading..." : "Upload New Photo"}
                      <input
                        type="file"
                        id="avatar-file-upload"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1.5 text-xs text-gray-400">
                      JPEG, PNG or WebP. Saved to cloud storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    required
                  />
                </div>
              </div>

              {/* Role & Location */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Admin Role / Position</Label>
                  <Input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Store Manager & Owner"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Madrid, España"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label>Bio / Responsibilities</Label>
                <Input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Store administrator & inventory director"
                />
              </div>

              {/* Social Links */}
              <div>
                <h5 className="mb-3 text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                  Social Links
                </h5>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Facebook URL</Label>
                    <Input
                      type="url"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <Label>X / Twitter URL</Label>
                    <Input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://x.com/..."
                    />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <Label>Instagram URL</Label>
                    <Input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving || isUploading}>
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
