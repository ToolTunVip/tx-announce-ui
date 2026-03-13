-- ╔══════════════════════════════════════════════════════════════╗
-- ║                  txCustomAnnounce - CONFIG                   ║
-- ╚══════════════════════════════════════════════════════════════╝

Config = {}

-- Framework: "auto" | "qb" | "esx" | "standalone"
Config.Framework = "auto"

-- Chế độ quyền: "identifier" | "ace" | "group" | "both"
-- identifier = danh sách license bên dưới (Standalone)
-- ace        = Ace Permission của txAdmin/FiveM
-- group      = job/group của ESX hoặc QBCore
-- both       = identifier + ace (có một là được)
Config.PermMode = "identifier"

-- Ace node (dùng khi PermMode = "ace" | "both")
Config.AceNode = "command.thongbao"

-- Danh sách admin identifier (dùng khi PermMode = "identifier" | "both")
-- Lấy identifier của bạn bằng lệnh /myid trong game
Config.AdminIdentifiers = {
    "license:03fc04fd3273a553718d2c8467443a697bc49848"
    -- "license:...",
}

-- Job/group được phép (ESX / QBCore)
Config.AllowedGroups = { "admin", "superadmin", "god", "mod" }

-- Tên lệnh
Config.Commands = {
    openPanel = "panel",
    closePanel = "closepanel",
    announce  = "thongbao",
}

-- Thông báo
Config.Messages = {
    noPermission = "^1[Lỗi]^7 Bạn không có quyền.",
    announceSent = "^2[txAnnounce]^7 Đã gửi: ",
    emptyMsg     = "^3[Hướng dẫn]^7 Dùng: /{cmd} [nội dung]",
}

-- Bật log debug ra console server
Config.Debug = false