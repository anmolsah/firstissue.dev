import React, { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";

const TECH_SUGGESTIONS = [
  "React", "Next.js", "Vue", "Nuxt", "Angular", "Svelte", "SvelteKit",
  "JavaScript", "TypeScript", "Node.js", "Express", "Fastify", "NestJS",
  "HTML", "CSS",
  "Python", "Django", "Flask", "FastAPI",
  "Java", "Spring Boot", "Kotlin",
  "Go", "Rust", "C++", "C#", ".NET",
  "Ruby", "Rails", "PHP", "Laravel",
  "Swift", "React Native", "Flutter", "Dart",
  "Tailwind CSS", "Bootstrap", "Sass",
  "GraphQL", "REST API", "tRPC",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase", "Firebase",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Vercel",
  "Git", "CI/CD", "Linux",
  "Machine Learning", "TensorFlow", "PyTorch",
  "Cloudflare",
];

const TechStackInput = ({
  id = "tech-stack-input",
  label = "Tech Stack",
  helperText = "Add languages or frameworks to improve SmartMatch issue recommendations.",
  placeholder = "e.g., React, Node.js, Python...",
  value = [],
  onChange,
  showQuickAdd = true,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filteredSuggestions = TECH_SUGGESTIONS.filter(
    (tech) =>
      tech.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tech)
  ).slice(0, 8);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = inputValue.replace(/,/g, "").trim();
      if (cleaned) {
        const match = filteredSuggestions.find(
          (s) => s.toLowerCase() === cleaned.toLowerCase()
        );
        addTag(match || cleaned);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
      )}
      {helperText && (
        <p className="text-xs text-[#8C929C] mb-2">{helperText}</p>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#17181B] text-[#F4F4F0] border border-[#2B2E36] rounded-[4px] text-xs font-mono"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="p-0.5 hover:bg-[#1C1E23] rounded-[4px] transition-colors text-[#8C929C] hover:text-[#F4F4F0] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative flex items-center gap-2">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : "Add technology (press Enter)..."}
          className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
        />
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => addTag(inputValue.replace(/,/g, "").trim())}
            className="px-3 py-2 bg-[#17181B] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#DAFA9C] rounded-[4px] text-xs font-mono font-semibold shrink-0 transition-colors cursor-pointer"
          >
            + Add
          </button>
        )}
      </div>

      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#17181B] border border-[#2B2E36] rounded-[4px] shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0] transition-colors text-left cursor-pointer"
            >
              <Plus className="w-3 h-3 text-[#DAFA9C] shrink-0" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {showQuickAdd && value.length === 0 && !inputValue && (
        <div className="mt-2.5">
          <p className="text-xs text-[#8C929C] mb-1.5 font-mono">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {["React", "TypeScript", "Node.js", "Python", "Next.js", "Tailwind CSS"].map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addTag(tech)}
                className="px-2.5 py-1 text-xs bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0] rounded-[4px] transition-colors cursor-pointer"
              >
                + {tech}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechStackInput;
