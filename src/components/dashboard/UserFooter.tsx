"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";

interface UserFooterProps {
  name: string;
  email: string;
  image?: string | null;
  signOutAction: () => Promise<void>;
}

export function UserFooter({ name, email, image, signOutAction }: UserFooterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex w-full items-center gap-2 rounded-md p-1 hover:bg-sidebar-accent" />
        }
      >
        <UserAvatar name={name} image={image} />
        <div className="flex-1 overflow-hidden text-left">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-52">
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<form action={signOutAction} />}>
          <button type="submit" className="flex w-full items-center gap-1.5">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
