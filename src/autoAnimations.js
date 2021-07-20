import { JB2APATREONDB } from "./animation-functions/jb2a-database.js/jb2a-patreon-database.js";
import { JB2AFREEDB } from "./animation-functions/jb2a-database.js/jb2a-free-database.js";

import Dnd5Handler from "./system-handlers/dnd5-handler.js";
import MidiHandler from "./system-handlers/midi-handler.js";
import Pf1Handler from "./system-handlers/pf1-handler.js";
import Dnd35Handler from "./system-handlers/dnd35-handler.js";
import Tormenta20Handler from './system-handlers/tormenta20-handler.js';
import DemonLordHandler from './system-handlers/demonlord-handler.js';
import SwadeHandler from './system-handlers/swade-handler.js';
import GeneralAnimHandler from "./system-handlers/generalAnim-handler.js";
import SW5eHandler from "./system-handlers/sw5e-handler.js";
import WFRP4eHandler from "./system-handlers/wfrp4e-handler.js";

import thunderwaveAuto from "./animation-functions/thunderwave.js";
import ctaCall from "./animation-functions/CTAcall.js";
import huntersMark from "./animation-functions/hunters-mark.js";
import bardicInspiration from "./animation-functions/bardic-inspiration.js";
import AAItemSettings from "./item-sheet-handlers/animateTab.js";

import { AAITEMCHECK } from "./animation-functions/item-arrays.js";
import { rangedAnimations } from "./animation-functions/rangedAnimation.js";
import { meleeAnimation } from "./animation-functions/meleeAnimation.js";
import { onTokenAnimation } from "./animation-functions/onTokenAnimation.js";
import { explodeOnToken } from "./animation-functions/explodeOnToken.js";
import { teleportation } from "./animation-functions/teleportation.js";
import { templateAnimation } from "./animation-functions/templateAnimation.js";
import { shieldSpell } from "./animation-functions/shield.js";
import { setupSocket } from "./socketset.js";

import ImagePicker from "./ImagePicker.js";

import SequencerApplication from "./item-sheet-handlers/sequenceApplication.js";
import "../lib/alpine.min.js"

// just swap which of these two lines is commented to turn on/off all logging
//const log = console.log.bind(window.console);
const log = () => { };

Hooks.once('setup', function () {
    setupSocket();
});

Hooks.on('init', () => {

    window.sequencerApp = new SequencerApplication();

    game.settings.register("autoanimations", "runonlyonce", { // game.setting.register("NameOfTheModule", "VariableName",
        name: game.i18n.format("AUTOANIM.initpopup_name"),                  // Register a module setting with checkbox
        hint: game.i18n.format("AUTOANIM.initpopup_hint"),               // Description of the settings
        scope: "world",                                    // This specifies a client-stored setting
        config: true,                                       // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: false,                                     // The default value for the setting
    });
    game.settings.register("autoanimations", "globaldelay", {
        name: game.i18n.format("AUTOANIM.globaldelay_name"),
        hint: game.i18n.format("AUTOANIM.globaldelay_hint"),
        scope: "world",
        config: true,
        default: 100,
        type: Number
    })
    game.settings.register("autoanimations", "animateLayer", {
        name: "Animations play above Overhead Tiles",
        hint: "Check to enable animations playing above Overhead Tiles (Requires a Refressh)",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => { window.location.reload() }
    })
    game.settings.register("autoanimations", "videoLoop", {
        name: "Autoplay Video previews in A-A Tab?",
        hint: "Check this box to autoplay video previews",
        scope: "world",
        type: String,
        choices: {
            "0": "No Video Preview",
            "1": "Manually Play Video Preview",
            "2": "Autoplay Video Preview"
        },
        default: "0",
        config: true
    })
    game.settings.register("autoanimations", "hideFromPlayers", { // game.setting.register("NameOfTheModule", "VariableName",
        name: game.i18n.format("AUTOANIM.animtab_name"),                  // Register a module setting with checkbox
        hint: game.i18n.format("AUTOANIM.animtab_hint"),               // Description of the settings
        scope: "world",                                    // This specifies a client-stored setting
        config: true,                                       // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: false,                                     // The default value for the setting
    });
    game.settings.register("autoanimations", "targetingAssist", {
        name: game.i18n.format("AUTOANIM.tarassist_name"),
        hint: game.i18n.format("AUTOANIM.tarassist_hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("autoanimations", "tmfx", {
        name: game.i18n.format("AUTOANIM.tfmxenable_name"),
        hint: game.i18n.format("AUTOANIM.tfmxenable_hint"),
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
    });
    switch (game.system.id) {
        case "demonlord": {
            if (!(game.data.version === "0.7.9" || game.data.version === "0.7.10")) {
                game.settings.register("autoanimations", "playtrigger", {
                    name: game.i18n.format("AUTOANIM.demonlordtrigger_name"),
                    hint: game.i18n.format("AUTOANIM.demonlordtrigger_hint"),
                    scope: "world",
                    type: String,
                    choices: {
                        "rollattack": game.i18n.format("AUTOANIM.demonlordtrigger_rollattack"),
                        "hits": game.i18n.format("AUTOANIM.demonlordtrigger_hits"),
                        "misses": game.i18n.format("AUTOANIM.demonlordtrigger_misses"),
                        "rolldamage": game.i18n.format("AUTOANIM.demonlordtrigger_rolldamage"),
                        "applydamage": game.i18n.format("AUTOANIM.demonlordtrigger_applydamage"),
                    },
                    default: "rollattack",
                    config: true
                })
            }
            break
        }
        case "sfrpg": {
            game.settings.register("autoanimations", "playonDamage", {
                name: game.i18n.format("AUTOANIM.midiondmg_name"),
                hint: game.i18n.format("AUTOANIM.midiondmg_hint"),
                scope: 'world',
                type: Boolean,
                default: false,
                config: true,
                onChange: () => { window.location.reload() }
            });
        }
        case "dnd5e":
        case "sw5e":
            if (game.modules.get("midi-qol")?.active) {
                game.settings.register("autoanimations", "playonhit", {
                    name: game.i18n.format("AUTOANIM.midionhit_name"),
                    hint: game.i18n.format("AUTOANIM.midionhit_hint"),
                    scope: 'world',
                    type: Boolean,
                    default: false,
                    config: true,
                });
                game.settings.register("autoanimations", "playonmiss", {
                    name: game.i18n.format("AUTOANIM.midionmiss_name"),
                    hint: game.i18n.format("AUTOANIM.midionmiss_hint"),
                    scope: `world`,
                    type: Boolean,
                    default: false,
                    config: true,
                });
                game.settings.register("autoanimations", "playonDamage", {
                    name: game.i18n.format("AUTOANIM.midiondmg_name"),
                    hint: game.i18n.format("AUTOANIM.midiondmg_hint"),
                    scope: 'world',
                    type: Boolean,
                    default: false,
                    config: true,
                    onChange: () => { window.location.reload() }
                });
                if (game.data.version === "0.7.9" || game.data.version === "0.7.10") {
                    game.settings.register("autoanimations", "EnableCritical", {
                        name: game.i18n.format("AUTOANIM.crithit_name"),
                        hint: game.i18n.format("AUTOANIM.crithit_hint"),
                        scope: 'world',
                        type: Boolean,
                        default: false,
                        config: true,
                        onchange: () => { window.location.reload() }
                    });
                    game.settings.register("autoanimations", "CriticalAnimation", {
                        name: game.i18n.format("AUTOANIM.crithitAnim_name"),
                        scope: 'world',
                        type: ImagePicker.Image,
                        default: "modules/JB2A_DnD5e/Library/Generic/UI/Critical_02_Red_200x200.webm",
                        config: true,
                        onchange: () => { window.location.reload() }
                    });
                    game.settings.register("autoanimations", "EnableCriticalMiss", {
                        name: game.i18n.format("AUTOANIM.critmiss_name"),
                        hint: game.i18n.format("AUTOANIM.critmiss_hint"),
                        scope: 'world',
                        type: Boolean,
                        default: false,
                        config: true,
                        onchange: () => { window.location.reload() }
                    });
                    game.settings.register("autoanimations", "CriticalMissAnimation", {
                        name: game.i18n.format("AUTOANIM.critmissAnim_name"),
                        scope: 'world',
                        type: ImagePicker.Image,
                        default: "modules/JB2A_DnD5e/Library/Generic/UI/Miss_02_White_200x200.webm",
                        config: true,
                        onchange: () => { window.location.reload() }
                    });
                } else {
                    game.settings.register("autoanimations", "EnableCritical", {
                        name: game.i18n.format("AUTOANIM.crithit_name"),
                        hint: game.i18n.format("AUTOANIM.crithit_hint"),
                        scope: 'world',
                        type: Boolean,
                        default: false,
                        config: true,
                        onchange: () => { window.location.reload() }
                    });
                    game.settings.register("autoanimations", "CriticalAnimation", {
                        name: game.i18n.format("AUTOANIM.crithitAnim_name"),
                        //name: "Choose A File",
                        scope: 'world',
                        config: true,
                        type: String,
                        filePicker: true
                    });
                    game.settings.register("autoanimations", "EnableCriticalMiss", {
                        name: game.i18n.format("AUTOANIM.critmiss_name"),
                        hint: game.i18n.format("AUTOANIM.critmiss_hint"),
                        scope: 'world',
                        type: Boolean,
                        default: false,
                        config: true,
                        onchange: () => { window.location.reload() }
                    });
                    game.settings.register("autoanimations", "CriticalMissAnimation", {
                        name: game.i18n.format("AUTOANIM.critmissAnim_name"),
                        scope: 'world',
                        config: true,
                        type: String,
                        filePicker: true
                    });
                }
            } else {
                game.settings.register("autoanimations", "playonDamageCore", {
                    name: game.i18n.format("AUTOANIM.coreondmg_name"),
                    hint: game.i18n.format("AUTOANIM.coreondmg_hint"),
                    scope: 'world',
                    type: Boolean,
                    default: false,
                    config: true,
                });
            }
            break;
    }
    game.settings.register("autoanimations", "EnableShield", {
        name: game.i18n.format("AUTOANIM.enableshield_name"),
        hint: game.i18n.format("AUTOANIM.enableshield_hint"),
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
    });

    if (game.modules.get("midi-qol")?.active) {
        log("midi IS active");
        switch (game.settings.get("autoanimations", "playonDamage")) {
            case (true):
                Hooks.on("midi-qol.DamageRollComplete", (workflow) => { revItUpMidi(workflow) });
                Hooks.on("createChatMessage", (msg) => { specialCaseAnimations(msg) });
                break;
            case (false):
                Hooks.on("midi-qol.RollComplete", (workflow) => { revItUpMidi(workflow) });
                Hooks.on("createChatMessage", (msg) => { specialCaseAnimations(msg) });
                break;
        }
        if (game.settings.get("autoanimations", "EnableCritical") || game.settings.get("autoanimations", "EnableCriticalMiss")) {
            Hooks.on("midi-qol.AttackRollComplete", (workflow) => { criticalChecks(workflow) })
        }

    } else {
        switch (game.system.id) {
            case "pf1":
            case "D35E":
                Hooks.on("createChatMessage", async (msg) => { onCreateChatMessage(msg) });
                break;
            case "dnd5e":
            case "sw5e":
                Hooks.on("createChatMessage", async (msg) => { revItUp5eCore(msg) });
                //Hooks.on("preCreateChatMessage", async (msg, options, userId) => {dnd5ecrits(msg)});
                break;
            case "tormenta20":
                Hooks.on("createChatMessage", async (msg) => { setupTormenta20(msg) });
                break;
            case "demonlord": {
                if (game.data.version === "0.7.9" || game.data.version === "0.7.10") {
                    Hooks.on("DL.ApplyDamage", setupDemonLord);
                    Hooks.on("DL.ApplyHealing", setupDemonLord);
                } else {
                    Hooks.on("DL.Action", setupDemonLord);
                }
            }
                break;
            case "sfrpg":
                Hooks.on("createChatMessage", async (msg) => {
                    function extractItemId(content) {
                        try {
                            return $(content).attr("data-item-id");
                        } catch (exception) {
                            return null;
                        }
                    }
                    let itemId = extractItemId(msg.data.content);
                    let tokenId;
                    let sourceToken;
                    let targets;
                    let item;
                    if (itemId === undefined) {
                        return
                    } else {
                        item = sourceToken.actor.items?.get(itemId)
                    }
                    if (!item.hasAttack && !item.hasDamage) {
                        tokenId = msg.data.speaker.token;
                        sourceToken = canvas.tokens.get(tokenId);
                        targets = Array.from(msg.user.targets)
                        AutoAnimations.playAnimation(sourceToken, targets, item)
                    }
                });
                if (game.settings.get("autoanimations", "playonDamage")) {
                    Hooks.on("damageRolled", async (data) => {
                        Hooks.once("createChatMessage", async (msg) => {
                            if (msg.user.id !== game.user.id) { return };
                            starFinder(data, msg)
                        });
                    });
                } else {
                    Hooks.on("attackRolled", async (data) => {
                        Hooks.once("createChatMessage", async (msg) => {
                            if (msg.user.id !== game.user.id) { return };
                            starFinder(data, msg)
                        });
                    })
                    Hooks.on("damageRolled", async (data) => {
                        Hooks.once("createChatMessage", async (msg) => {
                            if (msg.user.id !== game.user.id) { return };
                            if (data.item.hasAttack) {
                                return;
                            } else {
                                starFinder(data, msg)
                            }
                        });
                    })
                }
                break;
            case "swade":
                Hooks.on("swadeAction", async (SwadeActor, SwadeItem) => { swadeData(SwadeActor, SwadeItem) });
                break;
            case "wfrp4e":
                Hooks.on("wfrp4e:rollWeaponTest", async (data, info) => {
                    let targets = game.user.targets;
                    wfrpWeapon(data, targets, info)
                });
                Hooks.on("wfrp4e:rollPrayerTest", async (data, info) => {
                    let targets = game.user.targets;
                    wfrpPrayer(data, targets, info)
                });
                Hooks.on("wfrp4e:rollCastTest", async (data, info) => {
                    let targets = game.user.targets;
                    wfrpCast(data, targets, info)
                });
                Hooks.on("wfrp4e:rollTraitTest", async (data, info) => {
                    let targets = game.user.targets;
                    wfrpTrait(data, targets, info)
                });
                Hooks.on("wfrp4e:rollTest", async (data, info) => {
                    let targets = game.user.targets;
                    wfrpSkill(data, targets, info)
                });
                break;
        }
        //Hooks.on("createMeasuredTemplate", async (msg) => { getTemplateParams(msg) });
    }
    path00 = moduleIncludes("jb2a_patreon") === true ? `jb2a_patreon` : `JB2A_DnD5e`;
})
let critAnim;
let critMissAnim;

Hooks.on(`renderItemSheet`, async (app, html, data) => {
    if (!game.user.isGM && game.settings.get("autoanimations", "hideFromPlayers")) {
        return;
    }
    const aaBtn = $(`<a class="aa-item-settings" title="A-A"><i class="fas fa-biohazard"></i>A-A</a>`);
    if (game.data.version === "0.7.9" || game.data.version === "0.7.10") {
        aaBtn.click(ev => {
            new AAItemSettings(app.entity, {}).render(true);
        });
    } else {
        aaBtn.click(ev => {
            new AAItemSettings(app.document, {}).render(true);
        });
    }
    html.closest('.app').find('.aa-item-settings').remove();
    let titleElement = html.closest('.app').find('.window-title');
    aaBtn.insertAfter(titleElement);
});

Hooks.once('ready', function () {
    let obj01 = moduleIncludes("jb2a_patreon") === true ? JB2APATREONDB : JB2AFREEDB;

    Hooks.on("sequencer.ready", () => {
        SequencerDatabase.registerEntries("autoanimations", obj01);
    });
    if (game.user.isGM && (!game.modules.get("JB2A_DnD5e") && !game.modules.get("jb2a_patreon"))) {
        ui.notifications.error(game.i18n.format("AUTOANIM.error"));
    }
    if (game.user.isGM && game.modules.get("tokenmagic")?.active) {
        game.settings.set("tokenmagic", "fxPlayerPermission", true);
    }
    if (game.modules.get("midi-qol")?.active) {
        critAnim = game.settings.get("autoanimations", "CriticalAnimation");
        console.log(critAnim);
        critMissAnim = game.settings.get("autoanimations", "CriticalMissAnimation");
        console.log(critMissAnim)
    }
});

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

var path00;

class AutoAnimations {
    static playAnimation(sourceToken, targets, item) {
        let handler = new GeneralAnimHandler(sourceToken, targets, item);
        revItUp(handler);
    }
}

window.AutoAnimations = AutoAnimations;

function moduleIncludes(test) {
    return !!game.modules.get(test);
}

function onCreateChatMessage(msg) {
    if (msg.user.id !== game.user.id) { return };
    log('onCreateChatMessage', msg);
    let handler;
    switch (game.system.id) {
        case "pf1":
            handler = new Pf1Handler(msg);
            break;
        case "D35E":
            handler = new Dnd35Handler(msg);
            break;
    }
    if (game.user.id === msg.user.id) {
        switch (true) {
            case ((handler.animType === "t12") && (handler.animOverride)):
                teleportation(handler);
                break;
        }
    }
    revItUp(handler)
}

function swadeData(SwadeActor, SwadeItem) {
    let handler = new SwadeHandler(SwadeActor, SwadeItem);
    revItUp(handler);
}

function starFinder(data, msg) {
    let tokenId = msg.data.speaker.token;
    let sourceToken = canvas.tokens.get(tokenId);
    let targets = Array.from(msg.user.targets);
    let item = data.item;
    AutoAnimations.playAnimation(sourceToken, targets, item)
}

function revItUpMidi(workflow) {
    let handler = new MidiHandler(workflow);
    revItUp(handler);
}

function criticalChecks(workflow) {
    criticalCheck(workflow);
}

function setupTormenta20(msg) {
    let handler = new Tormenta20Handler(msg);
    if (game.user.id === msg.user.id) {
        switch (true) {
            case ((handler.animType === "t12") && (handler.animOverride)):
                teleportation(handler);
                break;
        }
    }
    if (game.user.id === msg.user.id) {
        return;
    }
    revItUp(handler);
}

function setupDemonLord(data) {
    let handler = new DemonLordHandler(data);
    revItUp(handler);
}

async function specialCaseAnimations(msg) {
    if (game.user.id !== msg.user.id) {
        return;
    }
    let handler = new Dnd5Handler(msg);
    switch (true) {
        /*
        case ((handler.animType === "t12") && (handler.animOverride)):
                teleportation(handler);
            break;
            */
        case (handler.animType === "t8" && handler.animOverride):
            Hooks.once("createMeasuredTemplate", (msg) => {
                templateAnimation(handler, msg);
            })
            break;
    }
}

function revItUp5eCore(msg) {
    if (msg.user.id !== game.user.id) { return };
    if (msg.data?.flavor?.includes("Long Rest")) { return };
    let handler;
    let rollType;
    switch (game.system.id) {
        case "dnd5e":
            handler = new Dnd5Handler(msg);
            rollType = (msg.data?.flags?.dnd5e?.roll?.type?.toLowerCase() ?? msg.data?.flavor?.toLowerCase() ?? "pass");
            break;
        case "sw5e":
            handler = new SW5eHandler(msg);
            rollType = msg.data?.flags?.sw5e?.roll?.type?.toLowerCase() ?? "pass";
            break;
    }
    if (!handler.item) { return }

    if (game.modules.get("mars-5e")?.active) {
        if (game.user.id === msg.user.id) {
            switch (true) {
                case ((handler.animType === "t12") && (handler.animOverride)):
                    teleportation(handler);
                    break;
            }
        }
        return;
    }

    if (handler.animType === "t11" && handler.animOverride) {
        if (game.modules.get("Custom-Token-Animations")?.active) {
            ctaCall(handler);
            return;
        }
    }
    if (handler.itemNameIncludes("bardic inspiration") || handler.itemNameIncludes(game.i18n.format("AUTOANIM.bardicInspiration").toLowerCase())) {
        bardicInspiration(handler);
    }

    if (handler.animType === "t8" && handler.animOverride) {
        Hooks.once("createMeasuredTemplate", (msg) => {
            templateEffects(handler, msg);
        });
        return;
    }

    if (game.user.id === msg.user.id) {
        switch (true) {
            case ((handler.animType === "t12") && (handler.animOverride)):
                teleportation(handler);
                break;
        }
    }

    //const rollType = (msg.data?.flags?.dnd5e?.roll?.type?.toLowerCase() ?? msg.data?.flavor?.toLowerCase() ?? "pass");
    if (game.settings.get("autoanimations", "playonDamageCore")) {
        if (rollType.includes("damage")) {
            //const itemType = myToken.actor.items.get(itemId).data.type.toLowerCase();
            if (handler.itemSound) {
                itemSound(handler);
            }
            if (game.modules.get("mre-dnd5e")?.active) {
                log("MRE is active");
                if (handler.itemIncludes("xxx") || handler.animKill) {
                    return;
                } else {
                    switch (game.settings.get("mre-dnd5e", "autoDamage")) {
                        case (true):
                            switch (true) {
                                case handler.convertedName.includes("thunderwave"):
                                case handler.convertedName.includes(game.i18n.format("AUTOANIM.itemThunderwave").toLowerCase()):
                                    Hooks.once("createMeasuredTemplate", () => {
                                        thunderwaveAuto(handler);
                                    })
                                    break;
                            }
                            break;
                        case (false):
                            revItUp(handler);
                            break;
                    }
                }

            } else { log("MRE is NOT active"); revItUp(handler); }
        }
    }
    if (!game.settings.get("autoanimations", "playonDamageCore")) {
        if (rollType.includes("damage")) {
            log("damage roll");
        } else
            if (rollType.includes("attack") || !handler.hasAttack) {
                if (handler.itemSound) {
                    itemSound(handler);
                }
                revItUp(handler)
            } else /*if (game.settings.get("autoanimations", "playonDamageCore") == false)*/ {
                if (handler.itemSound) {
                    itemSound(handler);
                }
                if (handler.itemIncludes("xxx") || handler.animKill) {
                    return;
                }

                else {
                    if (handler.itemSound) {
                        itemSound(handler);
                    }
                    switch (true) {
                        case handler.convertedName.includes("thunderwave"):
                        case handler.convertedName.includes(game.i18n.format("AUTOANIM.itemThunderwave").toLowerCase()):
                            Hooks.once("createMeasuredTemplate", () => {
                                thunderwaveAuto(handler);
                            })
                            break;
                    }
                }

            }
    }

}
async function itemSound(handler) {
    let audio = handler.allSounds.item;
    if (handler.itemSound) {
        await wait(audio.delay);
        AudioHelper.play({ src: audio.file, volume: audio.volume, autoplay: true, loop: false }, true);
    }
}
async function revItUp(handler) {
    if (handler.itemSound) {
        itemSound(handler);
    }
    if (handler.animKill) { return }

    if (game.modules.get("midi-qol")?.active) { } else {
        switch (game.system.id) {
            case "dnd5e":
                if (game.modules.get("mars-5e")?.active) {
                    if (handler.animType === "t8" && handler.animOverride) {
                        templateEffects(handler);
                        return;
                    }
                } else if (handler.animType === "t8" && handler.animOverride) {
                    Hooks.once("createMeasuredTemplate", (msg) => {
                        templateEffects(handler, msg);
                    });
                    return;
                }
                break;
            default:
                if (handler.animType === "t8" && handler.animOverride) {
                    templateEffects(handler);
                    return;
                }
        }
    }
    let itemName = handler.convertedName;
    switch (true) {
        case ((handler.animType === "t9") && handler.animOverride):
        case ((handler.animType === "t10") && handler.animOverride):
            explodeOnToken(handler);
            break;
        case ((handler.animType === "t11") && handler.animOverride):
            if (game.modules.get("Custom-Token-Animations")?.active) {
                ctaCall(handler);
            } else { ui.notifications.error("Custom Token Animations module must be Active") }
            break;
        case ((handler.animType === "t12") && (handler.animOverride)):
            teleportation(handler);
            break;
        case ((handler.animName === "shieldspell")):
            shieldSpell(handler);
            break;
        case itemName === "bardicinspiration":
            bardicInspiration(handler);
            break;
        case AAITEMCHECK.melee.includes(itemName):
        case AAITEMCHECK.monk.includes(itemName):
            meleeAnimation(handler);
            break;
        case itemName == "thunderwave":
            switch (true) {
                case (game.modules.get("midi-qol")?.active && (handler.autoDamage === "none")):
                    console.log(handler.autoDamage);
                    thunderwaveAuto(handler);
                    break;
                default:
                    Hooks.once("createMeasuredTemplate", () => {
                        console.log(handler.autoDamage);
                        thunderwaveAuto(handler);
                    })
            }
            break;
        case AAITEMCHECK.healing.includes(itemName):
        case AAITEMCHECK.creatureattack.includes(itemName):
            console.log("PRESTART")
            onTokenAnimation(handler);
            break;
        case AAITEMCHECK.spellattack.includes(itemName):
        case AAITEMCHECK.ranged.includes(itemName):
            rangedAnimations(handler);
            break;
        case itemName == "huntersmark":
            huntersMark(handler)
            break;
    }
}
async function criticalCheck(workflow) {

    if (!workflow.isCritical && !workflow.isFumble) { return; }
    let critical = workflow.isCritical;
    let fumble = workflow.isFumble;

    let token;
    let Anim;

    switch (true) {
        case (game.settings.get("autoanimations", "EnableCritical") && critical):
            token = canvas.tokens.get(workflow.tokenId);
            Anim =
            {
                file: critAnim,
                position: token.center,
                anchor: {
                    x: 0.5,
                    y: 0.5
                },
                angle: 0,
                scale: {
                    x: 1,
                    y: 1
                }
            };
            canvas.autoanimations.playVideo(Anim);
            game.socket.emit('module.autoanimations', Anim);
            break;
        case (game.settings.get("autoanimations", "EnableCriticalMiss") && fumble):
            token = canvas.tokens.get(workflow.tokenId);
            Anim =
            {
                file: critMissAnim,
                position: token.center,
                anchor: {
                    x: 0.5,
                    y: 0.5
                },
                angle: 0,
                scale: {
                    x: 1,
                    y: 1
                }
            };
            canvas.autoanimations.playVideo(Anim);
            game.socket.emit('module.autoanimations', Anim);
            break;
    }
    /*
    Hooks.on("preCreateChatMessage", async (msg, options, userId) => {
        let rollData = JSON.parse(msg.roll)
        const critMin = rollData.terms[0].options.critical
        const rollTotal = rollData.terms[0].results.find(i => i.active).result

        if (rollTotal >= critMin) { stuff }
    })
    */

}

//WFRP Functions
function wfrpWeapon(data, targets, info) {
    if (game.user.id !== info.user) { return }
    let item = data.weapon;
    let allTargets = Array.from(targets);
    let handler = new WFRP4eHandler(item, allTargets);
    switch (true) {
        case ((handler.animType === "t12") && (handler.animOverride)):
            teleportation(handler);
            break;
        default:
            revItUp(handler);
    }
}
function wfrpPrayer(data, targets, info) {
    if (game.user.id !== info.user) { return }
    let item = data.prayer;
    let allTargets = Array.from(targets);
    let handler = new WFRP4eHandler(item, allTargets);
    switch (true) {
        case ((handler.animType === "t12") && (handler.animOverride)):
            teleportation(handler);
            break;
        default:
            revItUp(handler);
    }
}
function wfrpCast(data, targets, info) {
    if (game.user.id !== info.user) { return }
    let item = data.spell;
    let allTargets = Array.from(targets);
    let handler = new WFRP4eHandler(item, allTargets);
    switch (true) {
        case ((handler.animType === "t12") && (handler.animOverride)):
            teleportation(handler);
            break;
        default:
            revItUp(handler);
    }
}
function wfrpTrait(data, targets, info) {
    if (game.user.id !== info.user) { return }
    let item = data.trait;
    let allTargets = Array.from(targets);
    let handler = new WFRP4eHandler(item, allTargets);
    switch (true) {
        case ((handler.animType === "t12") && (handler.animOverride)):
            teleportation(handler);
            break;
        default:
            revItUp(handler);
    }
}
function wfrpSkill(data, targets, info) {
    if (game.user.id !== info.user) { return }
    let item = data.skill;
    let allTargets = Array.from(targets);
    let handler = new WFRP4eHandler(item, allTargets);
    switch (true) {
        case ((handler.animType === "t12") && (handler.animOverride)):
            teleportation(handler);
            break;
        default:
            revItUp(handler);
    }
}












