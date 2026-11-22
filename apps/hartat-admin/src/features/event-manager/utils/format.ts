export function toDateInputValue(isoDate?: string): string {
    if (!isoDate) return ""
    const parsed = new Date(isoDate)
    if (Number.isNaN(parsed.getTime())) return ""
    return parsed.toISOString().slice(0, 10)
}

export function toTimeInputValue(isoDate?: string, isEnd = false): string {
    if (!isoDate) return ""
    const parsed = new Date(isoDate)
    if (Number.isNaN(parsed.getTime())) return ""

    const hms = parsed.toISOString().slice(11, 19)
    if (!isEnd && hms === "00:00:00") return ""
    if (isEnd && hms === "23:59:59") return ""

    return hms.slice(0, 5)
}

export function toEventDateTimeIso(dateInput: string, timeInput?: string, isEnd = false): string {
    const trimmedTime = timeInput?.trim()
    if (trimmedTime) {
        return `${dateInput}T${trimmedTime}:00.000Z`
    }
    return isEnd ? `${dateInput}T23:59:59.000Z` : `${dateInput}T00:00:00.000Z`
}

export function formatEventDate(dateStr?: string): string {
    if (!dateStr) return "-"
    const parsed = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00.000Z`)
    if (Number.isNaN(parsed.getTime())) return dateStr

    return parsed.toLocaleDateString("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
}

export function formatEventScheduleFromInputs(
    dateStart: string,
    dateEnd: string,
    timeStart = "",
    timeEnd = ""
): string {
    if (!dateStart && !dateEnd) return "-"

    const startDate = formatEventDate(dateStart)
    const endDate = dateEnd ? formatEventDate(dateEnd) : startDate
    const sameDay = !dateEnd || startDate === endDate

    if (sameDay) {
        if (timeStart && timeEnd) return `${startDate}, ${timeStart} - ${timeEnd}`
        if (timeStart) return `${startDate} às ${timeStart}`
        if (timeEnd) return `${startDate} até ${timeEnd}`
        return startDate
    }

    const startLabel = timeStart ? `${startDate} ${timeStart}` : startDate
    const endLabel = timeEnd ? `${endDate} ${timeEnd}` : endDate
    return `${startLabel} - ${endLabel}`
}

export function formatEventSchedule(dateStart?: string, dateEnd?: string): string {
    if (!dateStart && !dateEnd) return "-"

    const startDay = toDateInputValue(dateStart)
    const endDay = toDateInputValue(dateEnd)
    const startTime = toTimeInputValue(dateStart, false)
    const endTime = toTimeInputValue(dateEnd, true)

    return formatEventScheduleFromInputs(startDay, endDay, startTime, endTime)
}

export function getEventStatus(dateStart: string, dateEnd: string): "upcoming" | "ongoing" | "past" {
    const now = Date.now()
    const start = new Date(dateStart).getTime()
    const end = new Date(dateEnd).getTime()

    if (now > end) return "past"
    if (now < start) return "upcoming"
    return "ongoing"
}

export function formatDisplayUrl(url: string): string {
    return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "")
}
