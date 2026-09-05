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
      // Newly added contributors following the Contribution Book grow seamlessly onto the tree branches
      const extraIdx = idx - 1;
      const angle = (extraIdx * 137.5 * Math.PI) / 180;
      const dist = 180 + extraIdx * 25;
      organic = {
        x: Math.round(Math.cos(angle) * (dist * 1.1)),
        y: Math.round(Math.sin(angle) * (dist * 0.75) + 30),
      };
      const col = extraIdx % 5;
      const row = Math.floor(extraIdx / 5);
      grid = {
        x: -360 + col * 180,
        y: -50 + row * 95,
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
        ? "0x1a8f...b420"
        : `0x${((idx + 1) * 39281).toString(16).slice(0, 4)}...${((idx + 1) * 71623).toString(16).slice(0, 4)}`,
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

  // Viewport transformation state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
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
  }, []);

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
    setZoom((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(2))), 2.0));
  };

  const resetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Canvas Mouse Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
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
      setZoom(Math.min(Math.max(0.6, Number((touchStartRef.current.zoom * factor).toFixed(2))), 2.0));
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
      className="relative z-10 py-12 sm:py-20 px-3 sm:px-6 lg:px-8 border-t border-zinc-900/80 bg-[#0B0C10] overflow-hidden scroll-mt-16 select-none"
    >
      {/* Background Architectural Grid & Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-emerald-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2.5 sm:mb-4 leading-tight">
            The Contribution{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Tree
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto px-1">
            A living interactive canvas of developers who planted their first pull request into FirstIssue.dev.
            Explore the canopy, zoom into branches, and verify cryptographic contribution credentials.
          </p>
        </div>

        {/* Interactive Viewport Canvas Box */}
        <div className="relative w-full rounded-2xl border border-white/[0.08] bg-[#0c0d12]/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col justify-between min-h-[520px] sm:min-h-[620px]">
          {/* Top Floating Command Toolbar (Fully Responsive) */}
          <div className="relative z-30 w-full p-3 sm:p-4 border-b border-white/[0.06] bg-[#0c0d12]/85 backdrop-blur-md">
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                {/* Spotlight Search (⌘K / Ctrl+K) */}
                <div className="w-full sm:flex-1 sm:max-w-md min-w-[200px] relative">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
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
                      className="w-full bg-black/40 pl-8 pr-16 py-1.5 rounded-lg font-mono text-xs text-white placeholder-zinc-500 border border-white/[0.08] focus:border-emerald-500/50 focus:outline-none transition-all shadow-inner"
                    />
                    <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-[9px] text-zinc-400 border border-white/[0.06]">
                        ⌘K
                      </kbd>
                    </div>
                  </div>

                  {/* Search Dropdown Flyout */}
                  {searchFlyoutOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#11131a]/98 backdrop-blur-2xl rounded-xl border border-white/[0.1] shadow-2xl p-1.5 z-50 flex flex-col gap-1 max-h-60 overflow-y-auto">
                      <div className="px-2 py-1 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                        Canopy Matches ({searchResults.length})
                      </div>
                      {searchResults.length === 0 ? (
                        <div className="p-3 text-center text-xs text-zinc-500 font-mono">
                          No leaf found matching "{searchQuery}"
                        </div>
                      ) : (
                        searchResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => locateNode(c.id)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] transition-all text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={c.avatar}
                                alt={c.name}
                                className="w-6 h-6 rounded-full object-cover border border-white/[0.1]"
                                onError={(e) => {
                                  e.target.src = `https://avatar.vercel.sh/${c.github}`;
                                }}
                              />
                              <div>
                                <div className="text-xs text-white font-medium group-hover:text-emerald-400 transition-colors">
                                  {c.name}
                                </div>
                                <div className="font-mono text-[10px] text-zinc-400">
                                  {c.leafNumber} • @{c.github}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                              Locate
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Right Action Tools: Zoom & Arrangement Switcher */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-lg p-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => adjustZoom(-0.15)}
                      title="Zoom Out"
                      className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 font-mono text-[11px] text-zinc-400 min-w-[38px] text-center select-none">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustZoom(0.15)}
                      title="Zoom In"
                      className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={resetZoom}
                      title="Fit to Canopy"
                      className="px-2 h-7 flex items-center gap-1 rounded text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.08] font-mono text-[11px] transition-all cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Fit</span>
                    </button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-lg p-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setArrangement("organic")}
                      className={`px-2.5 h-7 flex items-center gap-1.5 rounded font-mono text-xs transition-all cursor-pointer ${
                        arrangement === "organic"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      <span className="text-[11px] sm:text-xs">Organic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrangement("grid")}
                      className={`px-2.5 h-7 flex items-center gap-1.5 rounded font-mono text-xs transition-all cursor-pointer ${
                        arrangement === "grid"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="text-[11px] sm:text-xs">Grid</span>
                    </button>
                  </div>

                  {/* Plant PR Action */}
                  <Link
                    to="/contribution-book"
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 h-7 sm:h-8 rounded-lg bg-emerald-400 text-black font-semibold text-xs hover:bg-emerald-300 transition-all shadow-[0_0_16px_rgba(78,222,163,0.35)] cursor-pointer"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Plant PR</span>
                  </Link>
                </div>
              </div>

              {/* Sub-bar: Cohort Filter Tabs & Legend */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs font-mono border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none touch-pan-x w-full sm:w-auto">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-1 shrink-0">
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
                      className={`px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        selectedCohort === cohort.id
                          ? "bg-white/[0.1] text-white border border-white/[0.15] font-bold"
                          : "bg-transparent text-zinc-400 hover:text-zinc-200 border border-transparent"
                      }`}
                    >
                      {cohort.label}
                    </button>
                  ))}
                </div>

                {/* Visual Legend (Hidden on small mobile) */}
                <div className="hidden lg:flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                    Genesis #001
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    Canopy Core
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                    Milestones
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
                    Fresh Sprout
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Viewport Area with Full Touch & Mouse Handling */}
          <div className="relative w-full flex-1 min-h-[460px] sm:min-h-[520px] overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-950/40 via-[#0B0C10] to-[#08090C]">
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
              className={`w-full h-full block touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
              style={{ width: "100%", height: "100%" }}
            />

            {/* Contributor Node Detailed Inspector Drawer / Modal (Responsive Bottom Sheet on Mobile, Card on Desktop) */}
            {activeModalNode && (
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 max-w-sm w-auto sm:w-full z-40 bg-[#12141c]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-3.5 sm:p-4 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200 max-h-[85%] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={activeModalNode.avatar}
                        alt={activeModalNode.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-400/60 shadow-lg"
                        onError={(e) => {
                          e.target.src = `https://avatar.vercel.sh/${activeModalNode.github}`;
                        }}
                      />
                      {activeModalNode.tier === "gold" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 flex items-center justify-center text-black">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {activeModalNode.name}
                        </h4>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-bold">
                          {activeModalNode.leafNumber}
                        </span>
                      </div>
                      <a
                        href={`https://github.com/${activeModalNode.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] sm:text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1 mt-0.5"
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
                    className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Cohort Badge */}
                <div className="mb-2.5 sm:mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px] text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {activeModalNode.cohortLabel}
                  </span>
                </div>

                {/* PR & Diff details */}
                <div className="bg-black/50 border border-white/[0.06] rounded-xl p-2.5 sm:p-3 mb-2.5 sm:mb-3 font-mono">
                  <div className="text-[10px] sm:text-[11px] font-medium text-emerald-300 mb-1 line-clamp-2">
                    {activeModalNode.prTitle}
                  </div>
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 pt-1.5 border-t border-white/[0.06]">
                    <span className="text-zinc-300">{activeModalNode.diff}</span>
                    <span>{activeModalNode.plantedAt}</span>
                  </div>
                </div>

                {/* Cryptographic Verification Badge */}
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] sm:text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cryptographically Verified PR</span>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-500 font-semibold">
                    {activeModalNode.hash}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`https://github.com/${activeModalNode.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-mono font-medium text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleApplaud(activeModalNode.id)}
                    title="Send appreciation"
                    className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3 h-3 fill-emerald-400" />
                    <span>+{sproutCount[activeModalNode.id] || 1}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Bottom Bar (Center Action Only) */}
          <div className="relative z-30 w-full p-2.5 sm:p-3 border-t border-white/[0.06] bg-[#0c0d12]/85 backdrop-blur-md flex items-center justify-end">
            <button
              type="button"
              onClick={resetZoom}
              title="Re-center View"
              className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-mono text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Center</span>
            </button>
          </div>
        </div>

        {/* Scalable Community Growth Callout (Bottom banner) */}
        <div className="mt-6 sm:mt-8 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate">
                Join the Tree via GitHub PR
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 sm:line-clamp-none">
                Follow our interactive Contribution Book to add your profile to <code className="text-zinc-300 font-mono">src/data/contributors.json</code>. Once merged, your leaf will grow onto the live canvas tree!
              </p>
            </div>
          </div>

          <Link
            to="/contribution-book"
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
          >
            <span>Read Contribution Book</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContributionTree;
