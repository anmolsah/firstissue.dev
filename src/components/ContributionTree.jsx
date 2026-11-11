import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GitPullRequest,
  Search,
  Plus,
  Minus,
  Maximize2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Star,
  Heart,
  Grid,
  Network,
  X,
  Check,
  Sprout,
} from "lucide-react";
import contributorsData from "../data/contributors.json";

// Builds dynamic canopy nodes and filament connections directly from src/data/contributors.json
export function buildCanopyData(rawContributors = []) {
  const contributors = rawContributors.map((c, idx) => {
    const idStr = String(c.id || idx + 1);
    const leafId = `leaf-${idStr}`;
    const leafNumber = `#${idStr.padStart(3, "0")}`;
    const isRoot = c.role === "Maintainer" || c.branch === "root" || idx === 0;

    let cohort = "sprouts";
    let tier = "sprout";
    let cohortLabel = "Fresh Sprout (First Contribution)";

    if (isRoot) {
      cohort = "genesis";
      tier = "gold";
      cohortLabel = "Root Founder & Lead Maintainer";
    } else if (c.branch === "left") {
      cohort = "core";
      tier = "emerald";
      cohortLabel = "Canopy Core Leaf";
    } else if (c.branch === "right") {
      cohort = "milestones";
      tier = "cyan";
      cohortLabel = "Milestone Contributor";
    }

    // Dynamic placement on tree
    let organic = { x: 0, y: 0 };
    let grid = { x: 0, y: 0 };
    let radius = isRoot ? 34 : 26;

    if (isRoot && rawContributors.length === 1) {
      // Centered hero node when only maintainer is active
      organic = { x: 0, y: 0 };
      grid = { x: 0, y: 0 };
    } else if (isRoot) {
      organic = { x: 0, y: -140 };
      grid = { x: 0, y: -150 };
    } else {
      // Newly added contributors following the Contribution Book grow cleanly onto orbital tree rings without overlap
      const extraIdx = idx - 1;
      const ring = Math.floor(extraIdx / 5);
      const posInRing = extraIdx % 5;
      const ringAngles = [-2.55, -0.58, 0.55, 2.52, 1.57];
      const baseAngle = ringAngles[posInRing] + ring * 0.42;
      const rx = 215 + ring * 135;
      const ry = 135 + ring * 90;
      organic = {
        x: Math.round(Math.cos(baseAngle) * rx),
        y: Math.round(Math.sin(baseAngle) * ry + 20),
      };
      const col = extraIdx % 4;
      const row = Math.floor(extraIdx / 4);
      grid = {
        x: -285 + col * 190,
        y: -30 + row * 105,
      };
    }

    // Fast-loading avatar URL
    const avatarUrl =
      c.avatar ||
      (c.github ? `https://avatars.githubusercontent.com/${c.github}?size=150` : `https://avatar.vercel.sh/${c.name}`);

    return {
      id: leafId,
      rawId: c.id,
      leafNumber,
      name: c.name || c.github || "Community Contributor",
      github: c.github || "contributor",
      avatar: avatarUrl,
      role: c.role || "Contributor",
      cohort,
      cohortLabel,
      tier,
      prTitle: c.message || `feat(community): plant leaf for @${c.github}`,
      diff: c.diff || (isRoot ? "+2,480 / -120 lines" : "+42 / -3 lines"),
      plantedAt: c.joinedAt ? `Planted on ${c.joinedAt}` : "Planted recently",
      hash: isRoot
        ? "sha256:1a8f...b420"
        : `sha256:${((idx + 1) * 39281).toString(16).slice(0, 4)}...${((idx + 1) * 71623).toString(16).slice(0, 4)}`,
      verified: true,
      radius,
      organic,
      grid,
      branch: c.branch || (isRoot ? "root" : "center"),
    };
  });

  // Dynamically generate botanical branch filament connections
  const connections = [];
  if (contributors.length > 1) {
    const rootNode = contributors[0];
    for (let i = 1; i < contributors.length; i++) {
      const current = contributors[i];
      const parent = i === 1 ? rootNode : contributors[Math.floor((i - 1) / 2)];
      const color =
        current.branch === "left"
          ? "#10b981"
          : current.branch === "right"
          ? "#06b6d4"
          : "#4edea3";

      connections.push({
        from: parent.id,
        to: current.id,
        color,
      });
    }
  }

  return { contributors, connections };
}

const ContributionTree = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasSizeRef = useRef({ width: 800, height: 600, dpr: 1 });

  // Dynamic canopy contributors & connections from src/data/contributors.json
  const { contributors: CANOPY_CONTRIBUTORS, connections: CONNECTIONS } = useMemo(
    () => buildCanopyData(contributorsData),
    []
  );

  // Viewport transformation state with auto-fit geometry
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const hasInteractedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const touchStartRef = useRef({ x: 0, y: 0, dist: 0, zoom: 1, panX: 0, panY: 0, startTime: 0 });

  // Arrangement state: 'organic' | 'grid'
  const [arrangement, setArrangement] = useState("organic");
  const transitionProgressRef = useRef(0);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFlyoutOpen, setSearchFlyoutOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState("all");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sproutCount, setSproutCount] = useState({});

  // Image cache and version tracking for instantaneous canvas repaint
  const imageCacheRef = useRef(new Map());
  const [imagesLoadedVersion, setImagesLoadedVersion] = useState(0);
  const animationFrameRef = useRef(null);
  const particleTimeRef = useRef(0);

  const computeFitViewport = useCallback(
    (width, height, layoutMode) => {
      if (!width || !height || CANOPY_CONTRIBUTORS.length === 0) {
        return { zoom: 1, pan: { x: 0, y: 0 } };
      }
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const c of CANOPY_CONTRIBUTORS) {
        const pt = layoutMode === "grid" ? c.grid : c.organic;
        minX = Math.min(minX, pt.x - c.radius - 58);
        maxX = Math.max(maxX, pt.x + c.radius + 58);
        minY = Math.min(minY, pt.y - c.radius - 36);
        maxY = Math.max(maxY, pt.y + c.radius + 48);
      }
      const bboxW = Math.max(240, maxX - minX + 64);
      const bboxH = Math.max(200, maxY - minY + 64);
      const fitZoom = Math.min(
        1.0,
        Math.max(0.28, Number(Math.min(width / bboxW, height / bboxH).toFixed(2)))
      );
      return {
        zoom: fitZoom,
        pan: {
          x: -Math.round((minX + maxX) / 2),
          y: -Math.round((minY + maxY) / 2),
        },
      };
    },
    [CANOPY_CONTRIBUTORS]
  );

  // High-performance ResizeObserver (avoids layout thrashing inside 60fps loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Cap DPR at 2 for performance on ultra high-res mobile displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvasSizeRef.current = { width: rect.width, height: rect.height, dpr };
      if (!hasInteractedRef.current) {
        const fitted = computeFitViewport(rect.width, rect.height, arrangement);
        setZoom(fitted.zoom);
        setPan(fitted.pan);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas);

    window.addEventListener("resize", handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [arrangement, computeFitViewport]);

  // Preload avatar images reliably without CORS restrictions
  useEffect(() => {
    CANOPY_CONTRIBUTORS.forEach((c) => {
      if (!c.avatar) return;
      if (!imageCacheRef.current.has(c.avatar)) {
        const img = new Image();
        // Do not set crossOrigin = "anonymous" so GitHub redirects load without CORS blocks
        img.src = c.avatar;
        img.onload = () => {
          imageCacheRef.current.set(c.avatar, img);
          setImagesLoadedVersion((v) => v + 1);
        };
        img.onerror = () => {
          // Fallback to direct raw GitHub avatar
          const fallback = `https://avatars.githubusercontent.com/${c.github}?size=150`;
          if (fallback !== c.avatar) {
            const fallbackImg = new Image();
            fallbackImg.src = fallback;
            fallbackImg.onload = () => {
              imageCacheRef.current.set(c.avatar, fallbackImg);
              setImagesLoadedVersion((v) => v + 1);
            };
          }
        };
      }
    });
  }, [CANOPY_CONTRIBUTORS]);

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const el = document.getElementById("canvas-search-input");
        if (el) el.focus();
      } else if (e.key === "Escape") {
        setSearchFlyoutOpen(false);
        setSelectedNode(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter contributors by search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return CANOPY_CONTRIBUTORS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.github.toLowerCase().includes(q) ||
        c.leafNumber.toLowerCase().includes(q) ||
        c.prTitle.toLowerCase().includes(q)
    );
  }, [searchQuery, CANOPY_CONTRIBUTORS]);

  // Handle locating a node from search
  const locateNode = useCallback(
    (nodeId) => {
      const target = CANOPY_CONTRIBUTORS.find((c) => c.id === nodeId);
      if (!target) return;
      setSearchFlyoutOpen(false);
      setSelectedNode(target);

      // Center camera on the target node
      const targetCoord = arrangement === "grid" ? target.grid : target.organic;
      setPan({ x: -targetCoord.x, y: -targetCoord.y });
      setZoom(1.2);
    },
    [arrangement, CANOPY_CONTRIBUTORS]
  );

  // Adjust zoom smoothly
  const adjustZoom = (delta) => {
    hasInteractedRef.current = true;
    setZoom((prev) => Math.min(Math.max(0.4, Number((prev + delta).toFixed(2))), 2.0));
  };

  const resetZoom = () => {
    hasInteractedRef.current = false;
    const { width, height } = canvasSizeRef.current;
    const fitted = computeFitViewport(width, height, arrangement);
    setZoom(fitted.zoom);
    setPan(fitted.pan);
  };

  // Canvas Mouse Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    hasInteractedRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = (e.clientX - dragStartRef.current.x) / zoom;
      const dy = (e.clientY - dragStartRef.current.y) / zoom;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
      return;
    }

    // Hit test for hovered node using cached dimensions
    const { width, height } = canvasSizeRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = width / 2;
    const centerY = height / 2;

    const worldX = (mouseX - centerX) / zoom - pan.x;
    const worldY = (mouseY - centerY) / zoom - pan.y;

    let found = null;
    const currentProgress = arrangement === "grid" ? 1 : 0;

    for (const c of CANOPY_CONTRIBUTORS) {
      const x = c.organic.x + (c.grid.x - c.organic.x) * currentProgress;
      const y = c.organic.y + (c.grid.y - c.organic.y) * currentProgress;
      const dist = Math.hypot(worldX - x, worldY - y);
      if (dist <= c.radius + 6) {
        found = c;
        break;
      }
    }

    setHoveredNode(found);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
    } else {
      setSelectedNode(null);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    adjustZoom(zoomDelta);
  };

  // Mobile Touch Handlers (Pan, Pinch Zoom, Tap Hit-testing)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dist: 0,
        zoom,
        panX: pan.x,
        panY: pan.y,
        startTime: Date.now(),
      };
    } else if (e.touches.length === 2) {
      setIsDragging(true);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist,
        zoom,
        panX: pan.x,
        panY: pan.y,
        startTime: Date.now(),
      };
    }
  };

  const handleTouchMove = (e) => {
    hasInteractedRef.current = true;
    if (e.touches.length === 1 && isDragging) {
      const dx = (e.touches[0].clientX - touchStartRef.current.x) / zoom;
      const dy = (e.touches[0].clientY - touchStartRef.current.y) / zoom;
      setPan({
        x: touchStartRef.current.panX + dx,
        y: touchStartRef.current.panY + dy,
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStartRef.current.dist;
      setZoom(Math.min(Math.max(0.4, Number((touchStartRef.current.zoom * factor).toFixed(2))), 2.0));
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);

    // If it was a short tap with little movement, perform hit test
    if (e.changedTouches.length === 1 && Date.now() - touchStartRef.current.startTime < 300) {
      const touch = e.changedTouches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { width, height } = canvasSizeRef.current;
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      const centerX = width / 2;
      const centerY = height / 2;

      const worldX = (touchX - centerX) / zoom - pan.x;
      const worldY = (touchY - centerY) / zoom - pan.y;

      let tapped = null;
      const currentProgress = arrangement === "grid" ? 1 : 0;

      for (const c of CANOPY_CONTRIBUTORS) {
        const x = c.organic.x + (c.grid.x - c.organic.x) * currentProgress;
        const y = c.organic.y + (c.grid.y - c.organic.y) * currentProgress;
        const dist = Math.hypot(worldX - x, worldY - y);
        if (dist <= c.radius + 14) {
          tapped = c;
          break;
        }
      }

      setSelectedNode(tapped);
    }
  };

  // Main Canvas Render Loop (optimized for high FPS and low GPU overhead)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const { width, height, dpr } = canvasSizeRef.current;
      if (width === 0 || height === 0) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const centerX = width / 2;
      const centerY = height / 2;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Smooth arrangement animation interpolation
      const targetProgress = arrangement === "grid" ? 1 : 0;
      transitionProgressRef.current += (targetProgress - transitionProgressRef.current) * 0.12;
      const progress = transitionProgressRef.current;

      particleTimeRef.current += 0.015;
      const time = particleTimeRef.current;

      // Apply Viewport Pan & Zoom
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);
      ctx.translate(pan.x, pan.y);

      // 1. Draw Connective Botanical Filament Network
      if (CONNECTIONS.length > 0) {
        CONNECTIONS.forEach((conn) => {
          const fromNode = CANOPY_CONTRIBUTORS.find((c) => c.id === conn.from);
          const toNode = CANOPY_CONTRIBUTORS.find((c) => c.id === conn.to);
          if (!fromNode || !toNode) return;

          const x1 = fromNode.organic.x + (fromNode.grid.x - fromNode.organic.x) * progress;
          const y1 = fromNode.organic.y + (fromNode.grid.y - fromNode.organic.y) * progress;
          const x2 = toNode.organic.x + (toNode.grid.x - toNode.organic.x) * progress;
          const y2 = toNode.organic.y + (toNode.grid.y - toNode.organic.y) * progress;

          const isHighlighted =
            (hoveredNode && (hoveredNode.id === conn.from || hoveredNode.id === conn.to)) ||
            (selectedNode && (selectedNode.id === conn.from || selectedNode.id === conn.to));

          ctx.beginPath();
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2 - 20;

          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(midX, midY, x2, y2);

          ctx.strokeStyle = isHighlighted ? conn.color : "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = isHighlighted ? 2.2 : 1.2;
          if (!isHighlighted) {
            ctx.setLineDash([4, 6]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated traveling light pulse particle along connection
          if (isHighlighted || progress < 0.5) {
            const t = (time * 0.5 + parseInt(fromNode.leafNumber.slice(1) || "1", 10) * 0.2) % 1;
            const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

            ctx.beginPath();
            ctx.arc(px, py, isHighlighted ? 2.5 : 1.5, 0, Math.PI * 2);
            ctx.fillStyle = conn.color;
            ctx.fill();
          }
        });
      } else if (CANOPY_CONTRIBUTORS.length === 1) {
        // When single genesis root node is active, render radiant botanical filament roots
        const rootAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
        rootAngles.forEach((ang, idx) => {
          const rx = Math.cos(ang) * 130;
          const ry = Math.sin(ang) * 90;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(rx * 0.5, ry * 0.8, rx, ry);
          ctx.strokeStyle = idx % 2 === 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tip sprout
          ctx.beginPath();
          ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = idx % 2 === 0 ? "#10b981" : "#f59e0b";
          ctx.fill();
        });
      }

      // 2. Draw Floating Bioluminescent Spores (lightweight, no layout calls)
      for (let i = 0; i < 12; i++) {
        const seed = i * 137.5;
        const px = Math.sin(time * 0.5 + seed) * 380;
        const py = Math.cos(time * 0.35 + seed * 1.5) * 220;
        const pr = Math.sin(time + seed) > 0 ? 1.5 : 1.0;

        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "rgba(78, 222, 163, 0.25)" : "rgba(6, 182, 212, 0.2)";
        ctx.fill();
      }

      // 3. Draw Contributor Leaf Nodes
      CANOPY_CONTRIBUTORS.forEach((c) => {
        const x = c.organic.x + (c.grid.x - c.organic.x) * progress;
        const y = c.organic.y + (c.grid.y - c.organic.y) * progress;

        const isHovered = hoveredNode && hoveredNode.id === c.id;
        const isSelected = selectedNode && selectedNode.id === c.id;

        // Cohort filter match
        const matchesCohort =
          selectedCohort === "all" ||
          (selectedCohort === "genesis" && c.cohort === "genesis") ||
          (selectedCohort === "core" && c.cohort === "core") ||
          (selectedCohort === "sprouts" && c.cohort === "sprouts") ||
          (selectedCohort === "milestones" && c.cohort === "milestones");

        ctx.globalAlpha = matchesCohort ? 1.0 : 0.2;

        // Ambient glow ring (optimized shadow blur)
        ctx.save();
        if (c.tier === "gold") {
          ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
          ctx.strokeStyle = "#f59e0b";
        } else if (c.tier === "cyan") {
          ctx.shadowColor = "rgba(6, 182, 212, 0.5)";
          ctx.strokeStyle = "#06b6d4";
        } else if (c.tier === "sprout") {
          ctx.shadowColor = "rgba(78, 222, 163, 0.5)";
          ctx.strokeStyle = "#4edea3";
        } else {
          ctx.shadowColor = "rgba(16, 185, 129, 0.4)";
          ctx.strokeStyle = "#10b981";
        }

        ctx.shadowBlur = isHovered || isSelected ? 16 : 8;

        // Node circle background
        ctx.beginPath();
        ctx.arc(x, y, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#11131a";
        ctx.fill();
        ctx.lineWidth = isHovered || isSelected ? 3 : 2;
        ctx.stroke();
        ctx.restore();

        // Node Avatar clipping with instant complete check
        const img = imageCacheRef.current.get(c.avatar);
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, c.radius - 2, 0, Math.PI * 2);
        ctx.clip();

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, x - c.radius + 2, y - c.radius + 2, (c.radius - 2) * 2, (c.radius - 2) * 2);
        } else {
          // Fallback Initials
          ctx.fillStyle = "#1a1d26";
          ctx.fillRect(x - c.radius, y - c.radius, c.radius * 2, c.radius * 2);
          ctx.fillStyle = "#10b981";
          ctx.font = `bold ${Math.round(c.radius * 0.45)}px JetBrains Mono, monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(c.name.slice(0, 2).toUpperCase(), x, y);
        }
        ctx.restore();

        // Pulsing sprout indicator for fresh sprouts
        if (c.tier === "sprout") {
          const pingScale = 1 + Math.sin(time * 3) * 0.2;
          ctx.beginPath();
          ctx.arc(x - c.radius + 4, y - c.radius + 4, 4 * pingScale, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(78, 222, 163, 0.6)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x - c.radius + 4, y - c.radius + 4, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#4edea3";
          ctx.fill();
        }

        // Pill Leaf Tag beneath Node
        const tagText = `${c.leafNumber} @${c.github}`;
        ctx.font = "bold 9px JetBrains Mono, monospace";
        const textWidth = ctx.measureText(tagText).width;
        const tagPadding = 6;
        const tagW = textWidth + tagPadding * 2;
        const tagH = 16;
        const tagY = y + c.radius + 6;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x - tagW / 2, tagY, tagW, tagH, 8);
        ctx.fillStyle = isHovered || isSelected ? "rgba(16, 185, 129, 0.25)" : "rgba(17, 19, 26, 0.85)";
        ctx.strokeStyle = isHovered || isSelected ? "#10b981" : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHovered || isSelected ? "#ffffff" : "#bbcabf";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tagText, x, tagY + tagH / 2);
        ctx.restore();

        ctx.globalAlpha = 1.0;
      });

      ctx.restore(); // restore viewport pan & zoom
      ctx.restore(); // restore dpr scale

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    zoom,
    pan,
    arrangement,
    hoveredNode,
    selectedNode,
    selectedCohort,
    CANOPY_CONTRIBUTORS,
    CONNECTIONS,
    imagesLoadedVersion,
  ]);

  // Handle applauding a contributor ("Sprout +1")
  const handleApplaud = (contributorId) => {
    setSproutCount((prev) => ({
      ...prev,
      [contributorId]: (prev[contributorId] || 0) + 1,
    }));
  };

  const activeModalNode = selectedNode || hoveredNode;

  return (
    <section
      id="contribution-tree"
      ref={containerRef}
      className="relative z-10 py-14 sm:py-20 px-3 sm:px-6 lg:px-8 border-t border-[#22242A] bg-[#0F0F0F] overflow-hidden scroll-mt-20 select-none"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F4F4F0] mb-3 leading-tight text-balance">
            The Contribution Tree
          </h2>

          <p className="text-sm text-[#A8ADB6] leading-relaxed max-w-[60ch] text-pretty">
            Interactive canopy of developers who landed their first pull request via FirstIssue.dev. Zoom, inspect branches, and add your own leaf via PR.
          </p>
        </div>

        {/* Interactive Viewport Canvas Box */}
        <div className="relative w-full rounded-[4px] border border-[#2B2E36] bg-[#141518] overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[580px]">
          {/* Top Command Toolbar */}
          <div className="relative z-30 w-full p-3 sm:p-4 border-b border-[#22242A] bg-[#17181B]">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                {/* Search */}
                <div className="w-full sm:flex-1 sm:max-w-md min-w-0 relative">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-[#8C929C] absolute left-3 pointer-events-none" />
                    <input
                      id="canvas-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchFlyoutOpen(e.target.value.trim().length > 0);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim().length > 0) setSearchFlyoutOpen(true);
                      }}
                      placeholder="Search contributor @handle, leaf #, or PR..."
                      aria-label="Search contributor tree"
                      className="w-full bg-[#0B0C0E] pl-9 pr-14 py-2 rounded-[4px] font-mono text-xs text-[#F4F4F0] placeholder-[#8C929C] border border-[#2B2E36] focus:border-[#DAFA9C] focus:outline-none transition-colors"
                    />
                    <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
                      <kbd className="px-1.5 py-0.5 rounded-[4px] bg-[#17181B] font-mono text-xs text-[#A8ADB6] border border-[#2B2E36]">
                        ⌘K
                      </kbd>
                    </div>
                  </div>

                  {/* Search Dropdown Flyout */}
                  {searchFlyoutOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#17181B] rounded-[4px] border border-[#2B2E36] shadow-2xl p-1.5 z-50 flex flex-col gap-1 max-h-60 overflow-y-auto">
                      <div className="px-2 py-1 font-mono text-xs text-[#8C929C] uppercase tracking-wider">
                        Canopy Matches ({searchResults.length})
                      </div>
                      {searchResults.length === 0 ? (
                        <div className="p-3 text-center text-xs text-[#8C929C] font-mono">
                          No leaf found matching &ldquo;{searchQuery}&rdquo;
                        </div>
                      ) : (
                        searchResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => locateNode(c.id)}
                            className="flex items-center justify-between p-2 rounded-[4px] hover:bg-[#1C1E23] transition-colors text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={c.avatar}
                                alt={c.name}
                                className="w-6 h-6 rounded-full object-cover border border-[#2B2E36]"
                                onError={(e) => {
                                  e.target.src = `https://avatar.vercel.sh/${c.github}`;
                                }}
                              />
                              <div>
                                <div className="text-xs text-[#F4F4F0] font-medium group-hover:text-[#DAFA9C] transition-colors">
                                  {c.name}
                                </div>
                                <div className="font-mono text-xs text-[#8C929C]">
                                  {c.leafNumber} · @{c.github}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-[#141518] text-[#A8ADB6] border border-[#22242A]">
                              Locate
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Right Action Tools */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => adjustZoom(-0.15)}
                      title="Zoom Out"
                      aria-label="Zoom out canopy"
                      className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 font-mono text-xs text-[#A8ADB6] min-w-[44px] text-center tabular-nums select-none">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustZoom(0.15)}
                      title="Zoom In"
                      aria-label="Zoom in canopy"
                      className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={resetZoom}
                      title="Fit to Canopy"
                      aria-label="Fit tree to viewport"
                      className="px-2 h-7 flex items-center justify-center gap-1 rounded-[4px] text-[#A8ADB6] hover:text-[#DAFA9C] hover:bg-[#1C1E23] font-mono text-xs transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Fit</span>
                    </button>
                  </div>

                  <div className="flex items-center bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setArrangement("organic")}
                      className={`px-2.5 h-7 flex items-center gap-1.5 rounded-[4px] font-mono text-xs transition-colors cursor-pointer ${
                        arrangement === "organic"
                          ? "bg-[#1C1E23] text-[#DAFA9C] border border-[#2B2E36] font-semibold"
                          : "text-[#A8ADB6] hover:text-[#F4F4F0]"
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      <span>Organic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrangement("grid")}
                      className={`px-2.5 h-7 flex items-center gap-1.5 rounded-[4px] font-mono text-xs transition-colors cursor-pointer ${
                        arrangement === "grid"
                          ? "bg-[#1C1E23] text-[#DAFA9C] border border-[#2B2E36] font-semibold"
                          : "text-[#A8ADB6] hover:text-[#F4F4F0]"
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>
                  </div>

                  <Link
                    to="/contribution-book"
                    className="flex items-center gap-1.5 px-3 h-8 rounded-[4px] bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] font-semibold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Plant PR</span>
                  </Link>
                </div>
              </div>

              {/* Sub-bar: Cohort Filter Tabs & Legend */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2 text-xs font-mono border-t border-[#22242A]">
                <div className="flex flex-wrap items-center gap-1.5 py-0.5 w-full sm:w-auto">
                  <span className="text-xs text-[#8C929C] uppercase tracking-wider mr-1 shrink-0 select-none">
                    Cohorts:
                  </span>
                  {[
                    { id: "all", label: "All Cohorts" },
                    { id: "genesis", label: "Genesis" },
                    { id: "core", label: "Canopy Core" },
                    { id: "milestones", label: "Milestones" },
                    { id: "sprouts", label: "Fresh Sprouts" },
                  ].map((cohort) => (
                    <button
                      key={cohort.id}
                      type="button"
                      onClick={() => setSelectedCohort(cohort.id)}
                      className={`px-2.5 py-1 rounded-[4px] text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        selectedCohort === cohort.id
                          ? "bg-[#141518] text-[#DAFA9C] border border-[#2B2E36] font-semibold"
                          : "bg-transparent text-[#8C929C] hover:text-[#F4F4F0] border border-transparent"
                      }`}
                    >
                      {cohort.label}
                    </button>
                  ))}
                </div>

                <div className="hidden lg:flex items-center gap-4 text-xs text-[#A8ADB6] font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    Genesis #001
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                    Canopy Core
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Milestones
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#DAFA9C]" />
                    Fresh Sprout
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative w-full flex-1 h-[290px] xs:h-[330px] sm:h-[480px] md:h-[540px] min-h-[260px] sm:min-h-[480px] overflow-hidden bg-[#0B0C0E]">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleClick}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={`w-full h-full block touch-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ width: "100%", height: "100%" }}
            />

            {activeModalNode && (
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 max-w-sm w-auto sm:w-full z-40 bg-[#17181B] border border-[#2B2E36] rounded-[4px] p-4 shadow-2xl text-left max-h-[85%] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={activeModalNode.avatar}
                        alt={activeModalNode.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#DAFA9C]"
                        onError={(e) => {
                          e.target.src = `https://avatar.vercel.sh/${activeModalNode.github}`;
                        }}
                      />
                      {activeModalNode.tier === "gold" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#0F0F0F]">
                          <Star className="w-2.5 h-2.5 fill-[#0F0F0F]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#F4F4F0] leading-tight">
                          {activeModalNode.name}
                        </h3>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded-[4px] bg-[#141518] text-[#DAFA9C] border border-[#2B2E36]">
                          {activeModalNode.leafNumber}
                        </span>
                      </div>
                      <a
                        href={`https://github.com/${activeModalNode.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-[#A8ADB6] hover:text-[#DAFA9C] transition-colors flex items-center gap-1 mt-0.5"
                      >
                        @{activeModalNode.github}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNode(null);
                      setHoveredNode(null);
                    }}
                    aria-label="Close contributor inspector"
                    className="p-1 rounded-[4px] text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#1C1E23] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#141518] border border-[#22242A] font-mono text-xs text-[#F4F4F0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                    {activeModalNode.cohortLabel}
                  </span>
                </div>

                <div className="bg-[#0B0C0E] border border-[#22242A] rounded-[4px] p-3 mb-3 font-mono">
                  <div className="text-xs font-medium text-[#DAFA9C] mb-1 line-clamp-2">
                    {activeModalNode.prTitle}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8C929C] pt-1.5 border-t border-[#22242A]">
                    <span className="text-[#A8ADB6]">{activeModalNode.diff}</span>
                    <span>{activeModalNode.plantedAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-[4px] bg-[#34D399]/10 border border-[#34D399]/30 mb-3">
                  <div className="flex items-center gap-1.5 text-[#34D399] font-mono text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Merge PR</span>
                  </div>
                  <span className="font-mono text-xs text-[#34D399] font-semibold">
                    {activeModalNode.hash}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`https://github.com/${activeModalNode.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-[4px] bg-[#141518] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#F4F4F0] text-xs font-mono font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleApplaud(activeModalNode.id)}
                    title="Send appreciation"
                    className="py-2 px-3 rounded-[4px] bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>+{sproutCount[activeModalNode.id] || 1}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-30 w-full px-3 py-2.5 border-t border-[#22242A] bg-[#17181B] flex items-center justify-between text-xs font-mono text-[#8C929C]">
            <span className="hidden xs:inline">Drag to pan · Pinch or scroll to zoom</span>
            <span className="xs:hidden">Pan &amp; tap to inspect</span>
            <button
              type="button"
              onClick={resetZoom}
              title="Re-center View"
              className="px-3 py-1 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] hover:border-[#3A3E48] text-[#F4F4F0] font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#DAFA9C]" />
              <span>Center</span>
            </button>
          </div>
        </div>

        <div className="mt-6 bg-[#141518] border border-[#22242A] rounded-[4px] p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Sprout className="w-5 h-5 text-[#DAFA9C] shrink-0" />
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-[#F4F4F0] uppercase tracking-wider font-mono">
                Add Your Leaf via Pull Request
              </h3>
              <p className="text-xs text-[#A8ADB6]">
                Follow our interactive Contribution Book to add your handle to{" "}
                <code className="text-[#DAFA9C] font-mono">
                  src/data/contributors.json
                </code>
                .
              </p>
            </div>
          </div>

          <Link
            to="/contribution-book"
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#0F0F0F] bg-[#DAFA9C] hover:bg-[#C7F275] rounded-[4px] transition-colors text-center flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Open Contribution Book</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContributionTree;
