import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

interface Dot {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseAlpha: number;
  baseRadius: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface InteractiveDotFieldProps {
  protectedSelector?: string;
}

export function InteractiveDotField({
  protectedSelector = '[data-auth-card="true"]',
}: InteractiveDotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = Boolean(prefersReducedMotion);

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots: Dot[] = [];
    let ripples: Ripple[] = [];
    let rafId: number | null = null;
    let isHidden = document.hidden;

    const pointer = {
      rawX: -9999,
      rawY: -9999,
      smoothX: -9999,
      smoothY: -9999,
      lastRippleX: -9999,
      lastRippleY: -9999,
      lastRippleTime: 0,
      lastMoveTime: 0,
      strength: 0,
      inside: false,
    };

    let protectedRect: { left: number; top: number; right: number; bottom: number } | null = null;

    const updateProtectedRect = () => {
      if (!protectedSelector) {
        protectedRect = null;
        return;
      }
      const el = document.querySelector(protectedSelector);
      if (!el) {
        protectedRect = null;
        return;
      }
      const r = el.getBoundingClientRect();
      protectedRect = {
        left: r.left - 8,
        top: r.top - 8,
        right: r.right + 8,
        bottom: r.bottom + 8,
      };
    };

    const buildDots = () => {
      const isCompact = width < 768;
      const spacing = isCompact ? 34 : width >= 1600 ? 30 : 28;
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      const offsetX = ((width - (cols - 1) * spacing) / 2);
      const offsetY = ((height - (rows - 1) * spacing) / 2);

      const nextDots: Dot[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const seed = Math.sin((row * 73.13 + col * 19.47) * 12.9898) * 43758.5453;
          const fracA = seed - Math.floor(seed);
          const seedB = Math.cos((row * 31.7 + col * 91.3) * 7.13) * 24634.6345;
          const fracB = seedB - Math.floor(seedB);

          // Very slight organic variation while preserving crisp dotted-line alignment
          const jitterX = (fracA - 0.5) * 2.5;
          const jitterY = (fracB - 0.5) * 2.5;
          const ox = offsetX + col * spacing + jitterX;
          const oy = offsetY + row * spacing + jitterY;

          nextDots.push({
            ox,
            oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
            baseAlpha: 0.22 + fracA * 0.1,
            baseRadius: 1.2 + fracB * 0.35,
          });
        }
      }
      dots = nextDots;
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
      updateProtectedRect();
    };

    const drawStaticFrame = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let alpha = d.baseAlpha;
        if (
          protectedRect &&
          d.ox >= protectedRect.left &&
          d.ox <= protectedRect.right &&
          d.oy >= protectedRect.top &&
          d.oy <= protectedRect.bottom
        ) {
          alpha *= 0.25;
        }
        ctx.fillStyle = `rgba(134, 172, 148, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.ox, d.oy, d.baseRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let lastRectRefresh = 0;

    const renderFrame = (now: number) => {
      if (isHidden) {
        rafId = null;
        return;
      }

      if (now - lastRectRefresh > 400) {
        updateProtectedRect();
        lastRectRefresh = now;
      }

      ctx.clearRect(0, 0, width, height);

      // Immediate ramp-in for tight cursor coordination, calm settle after inactivity
      const idleMs = now - pointer.lastMoveTime;
      const isActivelyPointing = pointer.inside && idleMs < 2400;
      if (isActivelyPointing) {
        pointer.strength += (1 - pointer.strength) * 0.34;
      } else {
        pointer.strength += (0 - pointer.strength) * 0.05;
      }

      if (pointer.inside) {
        if (pointer.smoothX < -5000) {
          pointer.smoothX = pointer.rawX;
          pointer.smoothY = pointer.rawY;
        } else {
          // Responsive cursor tracking with zero sluggish lag
          pointer.smoothX += (pointer.rawX - pointer.smoothX) * 0.46;
          pointer.smoothY += (pointer.rawY - pointer.smoothY) * 0.46;
        }
      }

      // Advance subtle cursor wave ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 4.2;
        r.alpha *= 0.945;
        if (r.radius >= r.maxRadius || r.alpha <= 0.01) {
          ripples.splice(i, 1);
        }
      }

      const influenceRadius = width < 768 ? 135 : 185;
      const influenceRadiusSq = influenceRadius * influenceRadius;
      const maxPush = width < 768 ? 18 : 25;
      const hasPointer = pointer.strength > 0.01;

      // Subtle localized cursor glow (muted when hovering over auth card)
      if (hasPointer) {
        const inProtected =
          protectedRect !== null &&
          pointer.smoothX >= protectedRect.left &&
          pointer.smoothX <= protectedRect.right &&
          pointer.smoothY >= protectedRect.top &&
          pointer.smoothY <= protectedRect.bottom;

        const glowAlpha = (inProtected ? 0.02 : 0.075) * pointer.strength;
        const grad = ctx.createRadialGradient(
          pointer.smoothX,
          pointer.smoothY,
          0,
          pointer.smoothX,
          pointer.smoothY,
          influenceRadius * 1.15
        );
        grad.addColorStop(0, `rgba(182, 255, 80, ${glowAlpha.toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(128, 206, 98, ${(glowAlpha * 0.38).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(182, 255, 80, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.smoothX, pointer.smoothY, influenceRadius * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Critically damped spring constants (silky response, zero bounce/jitter)
      const springK = 0.16;
      const damping = 0.72;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const insideCard =
          protectedRect !== null &&
          d.ox >= protectedRect.left &&
          d.ox <= protectedRect.right &&
          d.oy >= protectedRect.top &&
          d.oy <= protectedRect.bottom;

        const cardDamp = insideCard ? 0.18 : 1;

        let targetX = d.ox;
        let targetY = d.oy;
        let proximity = 0;

        if (hasPointer) {
          const dx = d.ox - pointer.smoothX;
          const dy = d.oy - pointer.smoothY;
          const distSq = dx * dx + dy * dy;

          if (distSq < influenceRadiusSq && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const t = 1 - dist / influenceRadius;
            const falloff = t * t * (3 - 2 * t);
            const push = falloff * maxPush * pointer.strength * cardDamp;
            const invDist = 1 / dist;
            targetX = d.ox + dx * invDist * push;
            targetY = d.oy + dy * invDist * push;
            proximity = falloff * pointer.strength * (insideCard ? 0.25 : 1);
          }
        }

        let rippleBoost = 0;
        if (!insideCard && ripples.length > 0) {
          for (let rIdx = 0; rIdx < ripples.length; rIdx++) {
            const rip = ripples[rIdx];
            const rdx = d.ox - rip.x;
            const rdy = d.oy - rip.y;
            const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
            const band = Math.abs(rDist - rip.radius);
            if (band < 32) {
              const ringWeight = 1 - band / 32;
              rippleBoost = Math.max(rippleBoost, ringWeight * rip.alpha);
            }
          }
        }

        // Smooth damped spring toward target
        d.vx = (d.vx + (targetX - d.x) * springK) * damping;
        d.vy = (d.vy + (targetY - d.y) * springK) * damping;
        d.x += d.vx;
        d.y += d.vy;

        const highlight = Math.min(1, proximity + rippleBoost * 1.25);

        // Interpolate dim emerald-grey (128, 166, 142) -> vibrant neon lime (182, 255, 80)
        const r = Math.round(128 + (182 - 128) * highlight);
        const g = Math.round(166 + (255 - 166) * highlight);
        const b = Math.round(142 + (80 - 142) * highlight);
        const alpha = d.baseAlpha * (insideCard ? 0.24 : 1) + highlight * 0.62;
        const radius = d.baseRadius + highlight * 0.95;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(0.92, alpha).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    const updatePointerCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const now = performance.now();

      pointer.rawX = x;
      pointer.rawY = y;
      pointer.lastMoveTime = now;
      pointer.inside = true;

      // Subtle rate-limited ripple outside card bounds
      const movedDx = x - pointer.lastRippleX;
      const movedDy = y - pointer.lastRippleY;
      const movedDistSq = movedDx * movedDx + movedDy * movedDy;
      const insideCard =
        protectedRect !== null &&
        clientX >= protectedRect.left &&
        clientX <= protectedRect.right &&
        clientY >= protectedRect.top &&
        clientY <= protectedRect.bottom;

      if (!insideCard && movedDistSq > 3600 && now - pointer.lastRippleTime > 260) {
        pointer.lastRippleX = x;
        pointer.lastRippleY = y;
        pointer.lastRippleTime = now;
        if (ripples.length >= 3) {
          ripples.shift();
        }
        ripples.push({
          x,
          y,
          radius: 16,
          maxRadius: 210,
          alpha: 0.28,
        });
      }
    };

    let lastTouchTime = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        lastTouchTime = performance.now();
        pointer.inside = false;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        lastTouchTime = performance.now();
        return;
      }
      updatePointerCoords(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (performance.now() - lastTouchTime < 800) return;
      updatePointerCoords(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      pointer.inside = false;
    };

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
      if (!isHidden && !reducedMotion && rafId === null) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else if (isHidden && rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleResize = () => {
      resizeCanvas();
      if (reducedMotion) {
        drawStaticFrame();
      }
    };

    resizeCanvas();

    let resizeObserver: ResizeObserver | null = null;
    const attachCardObserver = () => {
      if (resizeObserver || !protectedSelector) return false;
      const cardEl = document.querySelector(protectedSelector);
      if (!cardEl) return false;
      updateProtectedRect();
      if (reducedMotion) {
        drawStaticFrame();
      }
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          updateProtectedRect();
          if (reducedMotion) {
            drawStaticFrame();
          }
        });
        resizeObserver.observe(cardEl);
      }
      return true;
    };

    let cardPollTimer: number | null = null;
    if (!attachCardObserver()) {
      cardPollTimer = window.setInterval(() => {
        if (attachCardObserver() && cardPollTimer !== null) {
          window.clearInterval(cardPollTimer);
          cardPollTimer = null;
        }
      }, 120);
    }

    if (reducedMotion) {
      drawStaticFrame();
      window.addEventListener('resize', handleResize, { passive: true });
      return () => {
        window.removeEventListener('resize', handleResize);
        if (cardPollTimer !== null) window.clearInterval(cardPollTimer);
        resizeObserver?.disconnect();
      };
    }

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!isHidden) {
      rafId = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (cardPollTimer !== null) {
        window.clearInterval(cardPollTimer);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver?.disconnect();
    };
  }, [prefersReducedMotion, protectedSelector]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none"
    />
  );
}
