// ==UserScript==
// @name         DK Mega-Balíček by HumSterCZ
// @namespace    https://github.com/HumSterCZ/dk-scripts
// @version      8.2
// @description  Komplexní automatizace a UI vylepšení pro Divoké kmeny. Centralizovaný ovládací panel.
// @author       HumSterCZ
// @license      MIT
// @match        https://*.divokekmeny.cz/game.php?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=divokekmeny.cz
// @grant        none
// ==/UserScript==

/*
 * -----------------------------------------------------------------------------
 *  Název: DK Mega-Balíček All-in-One (Centralized UI)
 *  Autor: HumSterCZ
 *  Verze: 8.2
 * -----------------------------------------------------------------------------
 *  MIT License
 *  
 *  Copyright (c) 2026 HumSterCZ
 *  
 *  Tímto se uděluje bezúplatná licence každé osobě, která získá kopii tohoto 
 *  softwaru a přidružené dokumentace, k nakládání se softwarem bez omezení, 
 *  včetně práv software užívat, kopírovat, upravovat, slučovat, publikovat 
 *  a/nebo distribuovat.
 * -----------------------------------------------------------------------------
 */

(function() {
    'use strict';
    
    // 1. Čištění starého UI
    let oldPanel = document.getElementById('dk-help-panel');
    if (oldPanel) oldPanel.remove();
    let oldModal = document.getElementById('dk-readme-modal');
    if (oldModal) oldModal.remove();

    // 2. Inicializace proměnných a stylů tlačítek pro panel
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get('screen');
    const mode = urlParams.get('mode');
    const tryConfirm = urlParams.get('try');
    
    const btnStyle = "background:#4caf50; color:white; border:1px solid #388e3c; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";
    const btnStyleBlue = "background:#3f51b5; color:white; border:1px solid #303f9f; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";
    const btnStyleOrange = "background:#ff9800; color:white; border:1px solid #e65100; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";
    const btnStyleRed = "background:#f44336; color:white; border:1px solid #d32f2f; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";

    // 3. Vytvoření hlavního panelu do DOMu (přidána sekce pro tlačítka)
    let panel = document.createElement('div');
    panel.id = 'dk-help-panel';
    panel.innerHTML = `
        <div style="position:fixed; top:60px; left:10px; background:#fdf2e3; border:2px solid #804000; padding:12px; z-index:10000; border-radius:5px; box-shadow:3px 3px 8px rgba(0,0,0,0.6); font-family:Verdana,Arial,sans-serif; font-size:12px; color:black; width:260px;">
            <h4 style="margin:0 0 8px 0; border-bottom:1px solid #804000; padding-bottom:5px; color:#804000;">HumSterCZ Nástroj v8.2</h4>
            <div style="margin-bottom:5px; font-weight:bold;">Aktivní na této stránce:</div>
            <ul id="dk-active-list" style="margin:0 0 10px 0; padding-left:20px; line-height:1.6; color:#444;"></ul>
            
            <div id="dk-action-container" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px; border-top:1px solid #804000; padding-top:10px;"></div>
            
            <div style="display:flex; gap:5px; border-top:1px solid #804000; padding-top:10px;">
                <button id="btn-readme" style="flex:1; background:#00bcd4; color:white; border:none; padding:8px 4px; cursor:pointer; border-radius:3px; font-weight:bold; box-shadow:1px 1px 3px rgba(0,0,0,0.4);">Read Me</button>
                <button id="btn-close-help" style="flex:1; background:#f44336; color:white; border:none; padding:8px 4px; cursor:pointer; border-radius:3px; font-weight:bold; box-shadow:1px 1px 3px rgba(0,0,0,0.4);">Skrýt</button>
            </div>
        </div>`;
    document.body.appendChild(panel);

    // Pomocná funkce pro vkládání popisků do panelu
    function addActiveInfo(text) {
        $('#dk-active-list').append(`<li>${text}</li>`);
    }

    // 4. Globální funkce (běží všude)
    initStorageWatcher();
    initGlobalHotkeys();
    addActiveInfo('Hlídač skladu (pozadí)');
    
    // 5. Hlavní Router pro aktivaci nástrojů
    if (screen === 'am_farm') {
        initFarmBot();
        addActiveInfo('Profi Farm Bot');
        addActiveInfo('[Mezerník] = Start/Stop Bota');
    } else if (screen === 'place' && tryConfirm === 'confirm') {
        initAttackTimer();
        addActiveInfo('Časovač útoků / Snipe');
    } else if (screen === 'overview_villages' && mode === 'incomings') {
        initIncomingDetector();
        initQuickRenamer();
        addActiveInfo('Detektor vláčků');
        addActiveInfo('Rychlé štítky');
    } else if (screen === 'snob') {
        initCoinMinter();
        addActiveInfo('Profi Razič mincí');
    } else if (screen === 'place' && mode === 'scavenge') {
        initScavenger();
        addActiveInfo('Rychlý Sběr');
    } else if (screen === 'place' && !tryConfirm && mode !== 'scavenge') {
        initEnhancedPlace();
        addActiveInfo('Rychlé vkládání vojsk');
        addActiveInfo('[F]=Fake | [S]=Špeh | [D]=Def | [Q]=Šlechta');
    } else if (screen === 'main') {
        initBuilderHelper();
        addActiveInfo('Pomocník stavitele');
    } else if (screen === 'train') {
        initMassTrain();
        addActiveInfo('Hromadná rekrutace');
    } else if (screen === 'report') {
        initReportCleaner();
        addActiveInfo('Čistič oznámení');
    } else if (screen === 'market' && (!mode || mode === 'send')) {
        initMarketHelper();
        addActiveInfo('Chytré Tržiště');
    } else if (screen === 'map' || screen === 'forum') {
        initCoordinateExtractor();
        addActiveInfo('Extraktor souřadnic');
    } else {
        // Pokud není na stránce žádná specifická akce, skryjeme prázdný action kontejner
        $('#dk-action-container').hide();
    }

    // 6. UI: Zavírání a Otevírání oken
    document.getElementById('btn-close-help').addEventListener('click', () => panel.remove());
    document.getElementById('btn-readme').addEventListener('click', () => {
        if(document.getElementById('dk-readme-modal')) return;
        
        let readmeModal = document.createElement('div');
        readmeModal.id = 'dk-readme-modal';
        readmeModal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10005; display:flex; justify-content:center; align-items:center;">
                <div style="background:#fdf2e3; border:3px solid #804000; padding:20px; border-radius:8px; width:90%; max-width:800px; max-height:85vh; overflow-y:auto; box-shadow:0 0 20px rgba(0,0,0,1); font-family:Verdana,Arial,sans-serif; color:black;">
                    <h2 style="color:#804000; border-bottom:2px solid #804000; padding-bottom:10px; margin-top:0;">HumSterCZ Script - Dokumentace modulů</h2>
                    <p style="font-size:13px; line-height:1.5;">Ovládání všech aktivních nástrojů se nachází v hlavním postranním panelu skriptu. Panel se dynamicky mění podle toho, na jaké stránce se zrovna nacházíš.</p>
                    
                    <h3 style="color:#3e2723; margin-bottom:5px;">Kompletní seznam funkcí a jak fungují:</h3>
                    
                    <ul style="font-size:13px; line-height:1.6; margin-top:0;">
                        <li><strong>Hlídač skladu (Všude):</strong> Běží trvale na pozadí. Automaticky obarví suroviny v horní liště na červeno, jakmile se tvůj sklad zaplní na více než 95 %.</li>
                        
                        <li><strong>Klávesové zkratky (Nádvoří):</strong> Umožňují rychlé ovládání bez myši. Stiskem [F] vložíš vojsko pro Fake, [S] pro 5 Špehů, [D] pro všechny obranné jednotky a [Q] pro Šlechtu.</li>
                        
                        <li><strong>Klávesové zkratky (Farm Bot):</strong> Stiskem [Mezerníku] v Pomocníkovi rabování bleskově zapneš nebo pozastavíš automatický běh Farm Bota.</li>
                        
                        <li><strong>Farm Bot (Pomocník rabování):</strong> V hlavním panelu nastavíš maximální vzdálenost. Po spuštění projíždí seznam vesnic a rozesílá A nebo B útoky. Zvládá sám překliknout na další stránku či vesnici, jakmile farma dojde.</li>
                        
                        <li><strong>Časovač útoků / Snipe (Nádvoří - Potvrzení):</strong> Do textových polí v panelu zadáš požadovaný čas a milisekundy dopadu. Skript nepřetržitě čte serverový čas a v přesně definovaný moment klikne na odeslat útok.</li>
                        
                        <li><strong>Detektor vláčků (Náhled - Příchozí):</strong> Automaticky projde tvé příchozí útoky. Pokud zjistí, že 3 a více útoků dopadá ve stejnou vteřinu, podbarví celou skupinu červeně a přidá varovný text [VLÁČEK].</li>
                        
                        <li><strong>Rychlé štítky (Náhled - Příchozí):</strong> Po kliknutí na tlačítko v panelu se u každého útoku objeví ikonky pro rychlé přejmenování (Šlechta, Beran, Sekera). Po kliknutí útok bleskově přejmenuje a uloží bez nutnosti načítání.</li>
                        
                        <li><strong>Profi Razič mincí (Panský dvůr):</strong> Po kliknutí na tlačítko v panelu najde skript odkaz pro vybrání maximálního počtu mincí a následně automaticky potvrdí jejich vyražení napříč tvým impériem.</li>
                        
                        <li><strong>Rychlý Sběr (Nádvoří - Sběr):</strong> Zmáčknutím tlačítka v panelu se vybere maximální množství volných jednotek a pošle se na průzkum do nejvyšší odemčené (volné) úrovně sběru.</li>
                        
                        <li><strong>Rychlé vkládání vojsk (Nádvoří):</strong> Obsahuje 4 tlačítka v panelu (Fake, Špeh, Obrana, Šlechta), která do formuláře pro odeslání rovnou předvyplní příslušné jednotky podle tvého výběru.</li>
                        
                        <li><strong>Pomocník stavitele (Hlavní budova):</strong> Zaškrtávací pole v hlavním panelu, které vizuálně skryje řádky budov, na které momentálně nemáš dostatek surovin. Přehlední to stavební frontu.</li>
                        
                        <li><strong>Hromadná rekrutace (Kasárna/Stáje/Dílna):</strong> Kliknutím v hlavním panelu skript automaticky rozpočítá dostupné suroviny do všech políček pro tvorbu jednotek a stiskne tlačítko rekrutovat.</li>
                        
                        <li><strong>Čistič oznámení (Oznámení):</strong> Tlačítko v panelu samočinně vyhledá a zaškrtne všechna oznámení označená zelenou tečkou (farma beze ztrát) a následně je odstraní.</li>
                        
                        <li><strong>Chytré Tržiště (Tržiště):</strong> Tlačítko v panelu zjistí počet tvých volných obchodníků a suroviny k odeslání do políček rozdělí přesně na rovnoměrné třetiny na základě jejich kapacity.</li>
                        
                        <li><strong>Extraktor souřadnic (Mapa/Fórum):</strong> Tlačítko v panelu proskenuje aktuální obrazovku, najde všechny vzory čísel formátu XXX|YYY, odstraní duplicitní záznamy a uloží ti čistý seznam do systémové schránky.</li>
                    </ul>
                    
                    <button id="btn-close-readme" style="background:#f44336; color:white; border:none; padding:10px; cursor:pointer; border-radius:4px; font-weight:bold; width:100%; font-size:14px; margin-top:15px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">Zavřít Dokumentaci</button>
                    <div style="text-align:center; margin-top:10px; font-size:10px; color:#888;">Created by HumSterCZ &copy; 2026</div>
                </div>
            </div>
        `;
        document.body.appendChild(readmeModal);
        document.getElementById('btn-close-readme').addEventListener('click', () => readmeModal.remove());
    });

    // ==============================================================================
    // CORE FUNKCE (Všechna tlačítka se nyní generují do #dk-action-container)
    // ==============================================================================

    function initGlobalHotkeys() {
        document.addEventListener('keydown', function(e) {
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if(screen === 'place' && !tryConfirm) {
                if(e.key.toLowerCase() === 'f') $('#btn-fake').click();
                if(e.key.toLowerCase() === 's') $('#btn-spy').click();
                if(e.key.toLowerCase() === 'd') $('#btn-def').click();
                if(e.key.toLowerCase() === 'q') $('#btn-snob').click();
            }
            if(screen === 'am_farm') {
                if(e.code === 'Space') {
                    e.preventDefault(); 
                    let btnStart = $('#btn-start'), btnStop = $('#btn-stop');
                    if(btnStart.is(':visible') && $('#bot-status').text() === 'Vypnuto') btnStart.click();
                    else btnStop.click();
                }
            }
        });
    }

    function initCoordinateExtractor() {
        $('#dk-action-container').append(`<button id="btn-extract-coords" style="${btnStyleBlue}">Kopírovat Souřadnice</button>`);
        $('#btn-extract-coords').click(function(e) { 
            e.preventDefault(); 
            let htmlContent = document.body.innerHTML; 
            let regex = /\d{3}\|\d{3}/g; 
            let matches = htmlContent.match(regex); 
            if(matches) { 
                let uniqueCoords = [...new Set(matches)]; 
                navigator.clipboard.writeText(uniqueCoords.join(' ')).then(() => { alert(`Zkopírováno ${uniqueCoords.length} unikátních souřadnic do schránky!`); }); 
            } else { 
                alert("Nenalezeny žádné souřadnice."); 
            } 
        }); 
    }

    function initQuickRenamer() { 
        $('#dk-action-container').append(`<button id="btn-show-renamers" style="${btnStyleBlue}">Zapnout rychlé přejmenování útoků</button>`);
        $('#btn-show-renamers').click(function(e) { 
            e.preventDefault(); 
            $(this).hide(); 
            $('#incomings_table tr.nowrap').each(function() { 
                let $row = $(this); 
                let commandId = $row.find('input[name^="id_"]').val(); 
                if(!commandId) return; 
                let renameHtml = `<div style="display:inline-block; margin-left:10px;"> <button class="quick-rename" data-id="${commandId}" data-name="Šlechta" style="background:#ff9800; border:none; border-radius:3px; cursor:pointer; padding:2px 5px; color:white;" title="Šlechta">Šlechta</button> <button class="quick-rename" data-id="${commandId}" data-name="Beran" style="background:#607d8b; border:none; border-radius:3px; cursor:pointer; padding:2px 5px; color:white;" title="Beran">Beran</button> <button class="quick-rename" data-id="${commandId}" data-name="Sekera" style="background:#f44336; border:none; border-radius:3px; cursor:pointer; padding:2px 5px; color:white;" title="Sekera">Sekera</button> </div>`; 
                $row.find('span.quickedit-content').append(renameHtml); 
            }); 
            $('.quick-rename').click(function(e) { 
                e.preventDefault(); 
                let newName = $(this).attr('data-name'); 
                $(this).closest('td').find('.rename-icon').click(); 
                setTimeout(() => { 
                    $(this).closest('td').find('input[type="text"]').val(newName); 
                    $(this).closest('td').find('input[type="button"]').click(); 
                }, 100); 
            }); 
        }); 
    }

    function initMarketHelper() { 
        $('#dk-action-container').append(`<button id="btn-market-balance" style="${btnStyle}">Rozdělit suroviny rovnoměrně</button>`);
        $('#btn-market-balance').click(function(e) { 
            e.preventDefault(); 
            let merchants = parseInt($('#market_merchant_available_count').text()||0); 
            if(merchants === 0) return alert("Nemáš volné obchodníky!"); 
            let totalCap = merchants * 1000; 
            let perRes = Math.floor(totalCap/3); 
            let w = parseInt($('#wood').text().replace(/\D/g,'')), s = parseInt($('#stone').text().replace(/\D/g,'')), i = parseInt($('#iron').text().replace(/\D/g,'')); 
            $('input[name="wood"]').val(Math.min(perRes,w)); 
            $('input[name="stone"]').val(Math.min(perRes,s)); 
            $('input[name="iron"]').val(Math.min(perRes,i)); 
        }); 
    }

    function initEnhancedPlace() { 
        $('#dk-action-container').append(`
            <button id="btn-fake" style="${btnStyle}">Fake [F]</button>
            <button id="btn-spy" style="${btnStyleBlue}">5 Špehů [S]</button>
            <button id="btn-def" style="${btnStyle}">Vše do obrany [D]</button>
            <button id="btn-snob" style="${btnStyleOrange}">Šlechta + Doprovod [Q]</button>
        `);
        $('#btn-fake').click(function(e){ e.preventDefault(); $('#unit_input_ram, #unit_input_spy').val(1); }); 
        $('#btn-spy').click(function(e){ e.preventDefault(); $('#unit_input_spy').val(5); }); 
        $('#btn-def').click(function(e){ e.preventDefault(); ['spear','sword','archer','heavy','catapult'].forEach(u=>{ $('#unit_input_'+u).closest('td').find('a').click(); }); }); 
        $('#btn-snob').click(function(e){ e.preventDefault(); $('#unit_input_snob').val(1); $('#unit_input_light').val(100); $('#unit_input_axe').val(100); }); 
    }

    function initMassTrain() { 
        $('#dk-action-container').append(`<button id="btn-train-all" style="${btnStyleOrange}">Vyplnit MAXIMUM do rekrutace</button>`);
        $('#btn-train-all').click(function(e){ 
            e.preventDefault(); 
            $('.train_unit a').click(); 
            setTimeout(()=>$('.btn-recruit').click(), 300); 
        }); 
    }

    function initReportCleaner() { 
        $('#dk-action-container').append(`<button id="btn-clean-reports" style="${btnStyleRed}">Smazat zelená oznámení</button>`);
        $('#btn-clean-reports').click(function(e){ 
            e.preventDefault(); 
            $('tr:has(img[src*="green."])').each(function(){ $(this).find('input[type="checkbox"]').prop('checked', true); }); 
            setTimeout(()=>$('input[name="del"]').click(), 300); 
        }); 
    }

    function initScavenger() { 
        $('#dk-action-container').append(`<button id="btn-scavenge-all" style="${btnStyle}">Vybrat vše a odeslat na sběr</button>`);
        $('#btn-scavenge-all').click(function(e){ 
            e.preventDefault(); 
            let fillAllBtn = $('a.fill-all'), startButtons = $('.free_send_button:not(:disabled)'); 
            if (startButtons.length > 0 && fillAllBtn.length > 0) { 
                fillAllBtn.click(); setTimeout(() => { startButtons.last().click(); }, 300); 
            } else { alert("Žádné volné jednotky."); } 
        }); 
    }

    function initBuilderHelper() { 
        $('#dk-action-container').append(`<label style="display:block; background:#e8f5e9; padding:5px; border-radius:3px; border:1px solid #4caf50; cursor:pointer;"><input type="checkbox" id="toggle-unavailable-bldgs"> Skrýt nedostupné budovy</label>`);
        $('#buildings tr').each(function(){ 
            let buildLink = $(this).find('a.btn-build'); 
            if(buildLink.length > 0){ 
                $(this).css('background-color','#e8f5e9'); 
                buildLink.css({'background-color':'#4caf50','color':'white'}); 
            } else { $(this).addClass('cannot-build'); } 
        }); 
        $('#toggle-unavailable-bldgs').change(function(){ 
            if($(this).is(':checked')){ $('.cannot-build').hide(); } else { $('.cannot-build').show(); } 
        }); 
    }

    function initStorageWatcher() { 
        setInterval(() => { 
            let storageCapacity = parseInt($('#storage').text().replace(/\D/g,'')); 
            if(!storageCapacity) return; 
            let warningLimit = storageCapacity * 0.95; 
            ['wood','stone','iron'].forEach(res => { 
                let currentAmount = parseInt($(`#${res}`).text().replace(/\D/g,'')); 
                if(currentAmount >= warningLimit) { $(`#${res}`).css({'color':'red','font-weight':'bold','text-shadow':'0px 0px 5px red'}); } 
                else { $(`#${res}`).css({'color':'','font-weight':'','text-shadow':''}); } 
            }); 
        }, 3000); 
    }

    function initCoinMinter() { 
        $('#dk-action-container').append(`<button id="btn-mint-max" style="${btnStyleOrange}">VYRAZIT MAXIMUM MINCÍ</button>`);
        $('#btn-mint-max').click(function(e){ 
            e.preventDefault(); 
            let selectAllBtn = $('a:contains("Zvolit maximální počet")').first(); 
            if(selectAllBtn.length > 0) { 
                selectAllBtn.click(); setTimeout(() => { let mintBtn = $('input.btn[value*="Vyrazit"]'); if(mintBtn.length > 0) mintBtn.click(); }, 300); 
            } else { 
                let mintBtn = $('.btn-default[type="submit"]'); if(mintBtn.length > 0) mintBtn.click(); 
            } 
        }); 
    }

    function initFarmBot() { 
        let isRunning = false, timeoutId = null; 
        $('#dk-action-container').append(`
            <div style="background:#e3c485; border:1px solid #804000; border-radius:3px; padding:8px;">
                <div style="font-weight:bold; text-align:center; margin-bottom:5px;">Farm Bot Nastavení</div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <label>Max A: <input type="number" id="max-dist-a" value="20" style="width:40px;"></label>
                    <label>Max B: <input type="number" id="max-dist-b" value="10" style="width:40px;"></label>
                </div>
                <div style="display:flex; gap:5px;">
                    <button id="btn-start" style="${btnStyle}">Start</button>
                    <button id="btn-stop" style="${btnStyleRed}">Stop</button>
                </div>
                <div id="bot-status" style="margin-top:5px; text-align:center; color:red; font-weight:bold;">Vypnuto</div>
            </div>
        `);
        function performFarmAction() { 
            if(!isRunning) return; 
            if($('#bot_check').length > 0) { isRunning = false; return; } 
            let maxDistA = parseFloat($('#max-dist-a').val()), maxDistB = parseFloat($('#max-dist-b').val()), actionTaken = false; 
            $('tr[id^="village_"]').each(function() { 
                if(actionTaken) return; 
                let row = $(this), distance = parseFloat(row.find('td:contains(".")').text().trim()); 
                if(isNaN(distance)) return; 
                let btnA = row.find('a.farm_icon_a'), btnB = row.find('a.farm_icon_b'); 
                if(row.find('img[src*="green.webp"]').length > 0 && distance <= maxDistA && !btnA.hasClass('disabled')) { 
                    btnA.click(); actionTaken = true; 
                } else if(row.find('img[src*="orange.webp"], img[src*="red.webp"]').length > 0 && distance <= maxDistB && !btnB.hasClass('disabled')) { 
                    btnB.click(); actionTaken = true; 
                } 
            }); 
            if(actionTaken) { 
                timeoutId = setTimeout(performFarmAction, Math.floor(Math.random()*600)+400); 
            } else { 
                let lc = parseInt(Accountmanager.farm.current_units?.light||0); 
                if(lc < 4) { 
                    $('#bot-status').text("Další vesnice..."); setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':68,'which':68})), 1000); 
                } 
            } 
        } 
        $('#btn-start').click(()=>{ isRunning = true; $('#bot-status').text('Běží...').css('color','green'); timeoutId = setTimeout(performFarmAction, 500); }); 
        $('#btn-stop').click(()=>{ isRunning = false; clearTimeout(timeoutId); $('#bot-status').text("Vypnuto").css('color','red'); }); 
    }

    function initAttackTimer() { 
        $('#dk-action-container').append(`
            <div style="background:#e3c485; border:1px solid #804000; border-radius:3px; padding:8px; text-align:center;">
                <div style="font-weight:bold; margin-bottom:5px;">Časovač dopadu (Snipe)</div>
                <input type="text" id="target-time" placeholder="14:30:00" style="width:70px; text-align:center;"> : 
                <input type="text" id="target-ms" value="000" style="width:35px; text-align:center;"><br>
                <button id="btn-set-timer" style="${btnStyle} margin-top:5px;">Nastavit automatický odpal</button>
            </div>
        `);
        let attackInterval; 
        $('#btn-set-timer').click(function(e) { 
            e.preventDefault(); 
            let targetTimeStr = $('#target-time').val().trim(), targetMs = parseInt($('#target-ms').val().trim())||0; 
            if(targetTimeStr.length !== 8) return alert("Zadej platný formát času dopadu!"); 
            $(this).css('background', 'orange').text('Čeká na odpal...');
            clearInterval(attackInterval); 
            attackInterval = setInterval(function() { 
                if($('#serverTime').text().trim() === targetTimeStr) { 
                    clearInterval(attackInterval); 
                    setTimeout(()=>$('#troop_confirm_submit').click(), targetMs); 
                } 
            }, 5); 
        }); 
    }

    function initIncomingDetector() { 
        let previousTime = "", trainCount = 1, $rowsToHighlight = []; 
        $('#incomings_table tr.nowrap').each(function() { 
            let $row = $(this), match = $row.find('td:eq(5)').text().trim().match(/(\d{2}:\d{2}:\d{2})/); 
            if(match) { 
                let currentTime = match[1]; 
                if(currentTime === previousTime) { 
                    trainCount++; $rowsToHighlight.push($row); 
                } else { 
                    if(trainCount >= 3) { 
                        $rowsToHighlight.forEach($r => { $r.css('background-color','#ffcccc'); $r.find('td:eq(0)').append(' <span style="color:red; font-weight:bold;">[VLÁČEK]</span>'); }); 
                    } 
                    trainCount = 1; $rowsToHighlight = [$row]; previousTime = currentTime; 
                } 
            } 
        }); 
    }

})();
