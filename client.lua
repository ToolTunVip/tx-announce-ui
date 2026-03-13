-- ╔══════════════════════════════════════════════════════════════╗
-- ║               txCustomAnnounce - CLIENT.LUA                  ║
-- ╚══════════════════════════════════════════════════════════════╝

local isOpen = false

local function dbg(msg)
    if Config.Debug then print("[txAnnounce] " .. msg) end
end

-- ── RESET KHI RESOURCE KHỞI ĐỘNG ─────────────────────────────
AddEventHandler("onClientResourceStart", function(res)
    if GetCurrentResourceName() ~= res then return end
    SetNuiFocus(false, false)
    isOpen = false
end)

-- ── NHẬN THÔNG BÁO ───────────────────────────────────────────
local function onAnnounce(data)
    local msg = ""
    if type(data) == "table" then
        msg = data.message or data.msg or data.text or data.content or ""
    elseif type(data) == "string" then
        msg = data
    end
    if msg == "" then msg = "Thông báo từ server" end
    dbg("Announce: " .. msg)
    SendNUIMessage({ type = "announce", message = msg })
end

RegisterNetEvent("txAdmin:events:announcement")
AddEventHandler("txAdmin:events:announcement", onAnnounce)

RegisterNetEvent("txAdmin:announcement")
AddEventHandler("txAdmin:announcement", onAnnounce)

RegisterNetEvent("announcement")
AddEventHandler("announcement", onAnnounce)

-- ── MỞ PANEL — server xác nhận quyền rồi mới trigger event này
RegisterNetEvent("txCustomAnnounce:openPanel")
AddEventHandler("txCustomAnnounce:openPanel", function()
    if isOpen then return end
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ type = "openPanel" })
    dbg("Panel opened")
end)

-- ── LỆNH /panel — chỉ gửi yêu cầu, server quyết định ─────────
RegisterCommand(Config.Commands.openPanel, function()
    if isOpen then return end
    TriggerServerEvent("txCustomAnnounce:requestPanel")
end, false)

-- ── ĐÓNG PANEL ────────────────────────────────────────────────
local function closePanel()
    isOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ type = "closePanel" })
    dbg("Panel closed")
end

RegisterNUICallback("closePanel", function(_, cb)
    closePanel(); cb({ ok = true })
end)

RegisterCommand(Config.Commands.closePanel, function()
    if isOpen then closePanel() end
end, false)

-- ── GỬI THÔNG BÁO TỪ PANEL ───────────────────────────────────
RegisterNUICallback("sendAnnouncement", function(data, cb)
    local msg = data and data.message or ""
    msg = msg:match("^%s*(.-)%s*$")
    if msg == "" then
        cb({ success = false, error = "Nội dung không được để trống!" })
        return
    end
    TriggerServerEvent("txCustomAnnounce:send", msg)
    cb({ success = true })
end)