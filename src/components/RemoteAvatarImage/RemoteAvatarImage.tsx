"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getTokenFromCookie } from "@/utilities/clientCookies";
import {
  remoteUriSameOriginAsConfiguredApi,
  resolveRemoteAssetUrl,
  toSecureRemoteUri,
} from "@/utilities/remote-avatar-url";

export interface RemoteAvatarImageProps {
  uri: string;
  fallbackUri?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Web avatar loader. Same-origin URLs (relative to `NEXT_PUBLIC_API_URL`) are tried
 * first with `Authorization: Bearer …`, then with a plain GET (like opening the URL in
 * a browser), then the next candidate (`fallbackUri`).
 */
export function RemoteAvatarImage({
  uri,
  fallbackUri,
  alt,
  width,
  height,
  className,
}: RemoteAvatarImageProps) {
  const [mounted, setMounted] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const securedPrimary = useMemo(() => {
    const t = uri?.trim();
    if (!t) return "";
    return resolveRemoteAssetUrl(t);
  }, [uri]);

  const securedFallback = useMemo(() => {
    const t = fallbackUri?.trim();
    if (!t) return "";
    return resolveRemoteAssetUrl(toSecureRemoteUri(t));
  }, [fallbackUri]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;

    let cancelled = false;
    revokeBlob();
    setDisplaySrc(null);

    async function load() {
      setLoading(true);

      const ordered: string[] = [];
      if (securedPrimary) ordered.push(securedPrimary);
      if (securedFallback && securedFallback !== securedPrimary) {
        ordered.push(securedFallback);
      }

      if (ordered.length === 0) {
        if (!cancelled) setLoading(false);
        return;
      }

      const token = getTokenFromCookie();

      const blobFromOkResponse = async (res: Response): Promise<boolean> => {
        if (!res.ok) return false;
        const blob = await res.blob();
        if (cancelled) return false;
        const objectUrl = URL.createObjectURL(blob);
        revokeBlob();
        blobUrlRef.current = objectUrl;
        setDisplaySrc(objectUrl);
        setLoading(false);
        return true;
      };

      const tryAuthenticated = async (url: string): Promise<boolean> => {
        if (!token) return false;
        try {
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          return await blobFromOkResponse(res);
        } catch {
          return false;
        }
      };

      /** Plain GET — matches opening the URL in a tab (no Bearer). */
      const tryAnonymousFetchToBlob = async (url: string): Promise<boolean> => {
        try {
          const res = await fetch(url, {
            cache: "no-store",
          });
          return await blobFromOkResponse(res);
        } catch {
          return false;
        }
      };

      const tryDirect = (url: string): boolean => {
        if (cancelled) return true;
        setDisplaySrc(toSecureRemoteUri(url) || url);
        setLoading(false);
        return true;
      };

      const resolveAt = async (idx: number): Promise<void> => {
        if (cancelled || idx >= ordered.length) {
          if (!cancelled) {
            setDisplaySrc(null);
            setLoading(false);
          }
          return;
        }

        const candidate = ordered[idx];
        const needsBearer = remoteUriSameOriginAsConfiguredApi(candidate);

        if (!needsBearer) {
          tryDirect(candidate);
          return;
        }

        if (token) {
          const okBearer = await tryAuthenticated(candidate);
          if (!cancelled && okBearer) return;
        }

        const okAnon = await tryAnonymousFetchToBlob(candidate);
        if (!cancelled && okAnon) return;

        await resolveAt(idx + 1);
      };

      await resolveAt(0);
    }

    Promise.resolve(load()).catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [mounted, revokeBlob, securedFallback, securedPrimary]);

  useEffect(() => () => revokeBlob(), [revokeBlob]);

  if (!mounted || loading || !displaySrc) {
    return (
      <div
        aria-hidden
        className={`flex items-center justify-center bg-[#1a2234] ${className ?? ""}`}
        style={{ width, height, maxWidth: "100%" }}
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
    />
  );
}
