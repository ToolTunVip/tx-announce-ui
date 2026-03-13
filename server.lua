-- ╔══════════════════════════════════════════════════════════════╗
-- ║               txCustomAnnounce - SERVER.LUA                  ║
-- ╚══════════════════════════════════════════════════════════════╝

local FW     = nil
local FWName = "standalone"

-- ── UTILS ─────────────────────────────────────────────────────
local function dbg(msg)
    if Config.Debug then print("[txAnnounce] " .. msg) end
end

local function inTable(val, tbl)
    for _, v in ipairs(tbl) do
        if v == val then return true end
    end
    return false
end

local function getIds(src)
    local t = {}
    for i = 0, GetNumPlayerIdentifiers(src) - 1 do
        t[#t+1] = GetPlayerIdentifier(src, i)
    end
    return t
end

-- ── KHỞI TẠO FRAMEWORK ───────────────────────────────────────
local function initFW()
    local name = Config.Framework
    if name == "auto" then
        if GetResourceState("qb-core")    == "started" then name = "qb"
        elseif GetResourceState("es_extended") == "started" then name = "esx"
        else name = "standalone" end
    end
    FWName = name

    if name == "qb" then
        local ok, core = pcall(function() return exports["qb-core"]:GetCoreObject() end)
        if ok and core then FW = core; print("[txAnnounce] Framework: QBCore")
        else FWName = "standalone"; print("[txAnnounce] QBCore load failed → standalone") end

    elseif name == "esx" then
        local ok, obj = pcall(function() return exports["es_extended"]:getSharedObject() end)
        if ok and obj then FW = obj; print("[txAnnounce] Framework: ESX")
        else
            TriggerEvent("esx:getSharedObject", function(o) FW = o end)
            print("[txAnnounce] Framework: ESX (event fallback)")
        end

    else
        print("[txAnnounce] Framework: Standalone")
    end
end

AddEventHandler("onResourceStart", function(res)
    if res == GetCurrentResourceName() then initFW() end
end)

-- ── KIỂM TRA QUYỀN ───────────────────────────────────────────
local function hasPermission(src)
    if src == 0 then return true end  -- console

    local mode = Config.PermMode

    -- Identifier
    if mode == "identifier" or mode == "both" then
        for _, id in ipairs(getIds(src)) do
            if inTable(id, Config.AdminIdentifiers) then
                dbg("ID matched: " .. id)
                return true
            end
        end
        if mode == "identifier" then return false end
    end

    -- Ace
    if mode == "ace" or mode == "both" then
        if IsPlayerAceAllowed(src, Config.AceNode) then
            dbg("ACE passed for " .. src)
            return true
        end
        if mode == "ace" then return false end
    end

    -- Framework group/job
    if FWName == "qb" and FW then
        local p = FW.Functions.GetPlayer(src)
        if p and inTable(p.PlayerData.group or "", Config.AllowedGroups) then
            return true
        end
    elseif FWName == "esx" and FW then
        local xp = FW.GetPlayerFromId(src)
        if xp then
            local job = xp.getJob()
            if job and inTable(job.name, Config.AllowedGroups) then return true end
        end
    end

    return false
end

local function deny(src)
    TriggerClientEvent("chat:addMessage", src, { args = { Config.Messages.noPermission } })
end

-- ── RELAY TXADMIN → CLIENT ────────────────────────────────────
AddEventHandler("txAdmin:events:announcement", function(data)
    TriggerClientEvent("txAdmin:events:announcement", -1, data)
end)

-- ── MỞ PANEL (client yêu cầu, server xác nhận rồi mới mở) ────
RegisterNetEvent("txCustomAnnounce:requestPanel")
AddEventHandler("txCustomAnnounce:requestPanel", function()
    local src = source
    if not hasPermission(src) then deny(src); return end
    TriggerClientEvent("txCustomAnnounce:openPanel", src)
    dbg("Panel opened for " .. src)
end)

-- ── GỬI THÔNG BÁO TỪ PANEL ───────────────────────────────────
RegisterNetEvent("txCustomAnnounce:send")
AddEventHandler("txCustomAnnounce:send", function(message)
    local src = source
    if not hasPermission(src) then deny(src); return end
    if not message or message:match("^%s*$") then return end
    TriggerClientEvent("txAdmin:events:announcement", -1, { message = message })
    print("[txAnnounce] Player " .. src .. " sent: " .. message)
end)

-- ── LỆNH /thongbao ────────────────────────────────────────────
RegisterCommand(Config.Commands.announce, function(src, args)
    if not hasPermission(src) then
        if src ~= 0 then deny(src) end
        return
    end
    local msg = table.concat(args, " ")
    if msg == "" then
        local hint = Config.Messages.emptyMsg:gsub("{cmd}", Config.Commands.announce)
        if src ~= 0 then TriggerClientEvent("chat:addMessage", src, { args = { hint } })
        else print(hint) end
        return
    end
    TriggerClientEvent("txAdmin:events:announcement", -1, { message = msg })
    local confirm = Config.Messages.announceSent .. msg
    if src ~= 0 then TriggerClientEvent("chat:addMessage", src, { args = { confirm } })
    else print(confirm) end
end, false)

-- ── LỆNH /myid — lấy identifier để điền config ───────────────
RegisterCommand("myid", function(src)
    if src == 0 then return end
    TriggerClientEvent("chat:addMessage", src, { args = { "^3[Identifiers của bạn]^7" } })
    for _, id in ipairs(getIds(src)) do
        TriggerClientEvent("chat:addMessage", src, { args = { id } })
    end
end, false)