"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { adminSections, type AdminSection } from "@/lib/admin-sections"
import { cn } from "@/lib/utils"

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function matchesQuery(section: AdminSection, query: string): boolean {
  const q = normalize(query)
  if (normalize(section.title).includes(q)) return true
  if (normalize(section.description).includes(q)) return true
  return section.keywords.some((kw) => normalize(kw).includes(q))
}

function getIsMac() {
  if (typeof navigator === "undefined") return true
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
}

const subscribe = () => () => {}
function useIsMac() {
  return useSyncExternalStore(subscribe, getIsMac, () => true)
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isMac = useIsMac()
  const modKey = isMac ? "⌘" : "Ctrl+"
  const router = useRouter()

  const filtered = useMemo(() => {
    if (!query.trim()) return adminSections
    return adminSections.filter((s) => matchesQuery(s, query))
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<string, AdminSection[]>()
    for (const section of filtered) {
      const group = map.get(section.group) || []
      group.push(section)
      map.set(section.group, group)
    }
    return map
  }, [filtered])

  const flatList = useMemo(() => filtered, [filtered])

  const openMenu = useCallback(() => {
    setOpen(true)
    setQuery("")
    setSelectedIndex(0)
  }, [])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setQuery("")
    setSelectedIndex(0)
  }, [])

  const navigate = useCallback(
    (section: AdminSection) => {
      closeMenu()
      router.push(section.href)
    },
    [closeMenu, router]
  )

  // Atalho global ⌘K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => {
          if (prev) return false
          setQuery("")
          setSelectedIndex(0)
          return true
        })
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus no input ao abrir
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Scroll para o item selecionado
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll("[data-command-item]")
    const item = items[selectedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  // Reset index quando a query muda
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % flatList.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + flatList.length) % flatList.length)
    } else if (e.key === "Enter" && flatList[selectedIndex]) {
      e.preventDefault()
      navigate(flatList[selectedIndex])
    } else if (e.key === "Escape") {
      e.preventDefault()
      closeMenu()
    }
  }

  if (!open) {
    return (
      <button
        onClick={openMenu}
        className="flex items-center gap-2.5 px-3.5 h-10 rounded-md border border-[#E5E2DD] text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          {modKey}K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0 duration-150"
        onClick={closeMenu}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        <div
          className="w-full max-w-lg bg-white rounded-md border border-[#E5E2DD] animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-[#E5E2DD]">
            <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar paginas, configuracoes..."
              className="flex-1 h-13 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center rounded-md border border-[#E5E2DD] bg-[#FAF9F7] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Resultados */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
            {flatList.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </div>
            ) : (
              Array.from(grouped.entries()).map(([group, items]) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {group}
                  </div>
                  {items.map((section) => {
                    const globalIndex = flatList.indexOf(section)
                    const isSelected = globalIndex === selectedIndex
                    const Icon = section.icon

                    return (
                      <button
                        key={section.id}
                        data-command-item
                        onClick={() => navigate(section)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          "flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-left transition-colors cursor-pointer",
                          isSelected
                            ? "bg-[#FAF9F7] text-foreground"
                            : "text-foreground/80 hover:bg-[#FAF9F7]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center h-9 w-9 rounded-md shrink-0",
                            section.iconBgColor
                          )}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {section.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {section.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
