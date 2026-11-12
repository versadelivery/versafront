import test from "node:test"
import assert from "node:assert/strict"
import {
  addDays,
  describeSchedule,
  formatDayLabel,
  formatSlotTime,
  inShopZone,
  isSlotAvailable,
  pickDayChips,
  todayInShopZone,
  type SchedulingDay,
} from "./scheduling.ts"

const days: SchedulingDay[] = [
  { date: "2026-11-12", slots: ["2026-11-12T20:00:00-03:00"] },
  { date: "2026-11-13", slots: ["2026-11-13T12:00:00-03:00", "2026-11-13T12:30:00-03:00"] },
  { date: "2026-11-14", slots: ["2026-11-14T12:00:00-03:00"] },
  { date: "2026-11-15", slots: ["2026-11-15T12:00:00-03:00"] },
  { date: "2026-11-16", slots: ["2026-11-16T12:00:00-03:00"] },
  { date: "2026-11-17", slots: ["2026-11-17T12:00:00-03:00"] },
]

test("formatSlotTime reads the shop clock straight from the ISO text", () => {
  assert.equal(formatSlotTime("2026-11-13T12:30:00-03:00"), "12:30")
  assert.equal(formatSlotTime("2026-11-14T00:00:00-03:00"), "00:00")
})

test("formatDayLabel: Hoje, Amanhã and weekday + date", () => {
  assert.equal(formatDayLabel("2026-11-12", "2026-11-12"), "Hoje")
  assert.equal(formatDayLabel("2026-11-13", "2026-11-12"), "Amanhã")
  assert.equal(formatDayLabel("2026-11-14", "2026-11-12"), "sáb, 14/11")
})

test("describeSchedule writes the full weekday, date and time", () => {
  assert.equal(describeSchedule("2026-11-13T12:00:00-03:00"), "sexta-feira, 13/11 às 12:00")
})

test("addDays crosses month and year boundaries", () => {
  assert.equal(addDays("2026-11-30", 1), "2026-12-01")
  assert.equal(addDays("2026-12-31", 1), "2027-01-01")
  assert.equal(addDays("2026-03-01", -1), "2026-02-28")
})

test("todayInShopZone uses Brasília time, not the browser's", () => {
  // 02:30 UTC do dia 13 ainda é 23:30 do dia 12 em Brasília
  assert.equal(todayInShopZone(new Date("2026-11-13T02:30:00Z")), "2026-11-12")
  assert.equal(todayInShopZone(new Date("2026-11-13T12:00:00Z")), "2026-11-13")
})

test("pickDayChips puts the most scheduled days first, then the next days, without repeats", () => {
  const chips = pickDayChips(days, [{ date: "2026-11-15" }, { date: "2026-11-13" }], 4)

  assert.deepEqual(chips.map((day) => day.date), ["2026-11-15", "2026-11-13", "2026-11-12", "2026-11-14"])
})

test("pickDayChips ignores popular days that have no slots and respects the limit", () => {
  const chips = pickDayChips(days, [{ date: "2026-12-25" }], 3)

  assert.deepEqual(chips.map((day) => day.date), ["2026-11-12", "2026-11-13", "2026-11-14"])
})

test("isSlotAvailable only accepts a time still offered", () => {
  assert.equal(isSlotAvailable(days, "2026-11-13T12:30:00-03:00"), true)
  assert.equal(isSlotAvailable(days, "2026-11-13T13:00:00-03:00"), false)
  assert.equal(isSlotAvailable(days, null), false)
})

test("inShopZone reads any ISO on the shop clock (UTC or with offset)", () => {
  assert.deepEqual(inShopZone("2026-11-13T12:00:00.000-03:00"), { date: "2026-11-13", time: "12:00" })
  assert.deepEqual(inShopZone("2026-11-14T02:30:00Z"), { date: "2026-11-13", time: "23:30" })
})
