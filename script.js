// ==UserScript==
// @name         DK Mega-Balíček by HumSterCZ
// @namespace    https://github.com/HumSterCZ/dk-scripts
// @version      8.5
// @description  Komplexní automatizace a UI vylepšení pro Divoké kmeny. Centralizovaný panel + nové komunitní funkce.
// @author       HumSterCZ
// @license      MIT
// @match        https://*.divokekmeny.cz/game.php?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=divokekmeny.cz
// @grant        none
// ==/UserScript==

/*
 * -----------------------------------------------------------------------------
 *  Název: DK Mega-Balíček All-in-One (Pro Edition)
 *  Autor: HumSterCZ
 *  Verze: 8.5
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

    // 2. Inicializace proměnných pro zjištění aktuální obrazovky
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get('screen');
    const mode = urlParams.get('mode');
    const tryConfirm = urlParams.get('try');
    
    const isPlace = (screen === 'place' && !tryConfirm);
    const isFarm = (screen === 'am_farm');

    // Styly tlačítek akcí
    const btnStyle = "background:#4caf50; color:white; border:1px solid #388e3c; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";
    const btnStyleBlue = "background:#3f51b5; color:white; border:1px solid #303f9f; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";
    const btnStyleOrange = "background:#ff9800; color:white; border:1px solid #e65100; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";
    const btnStyleRed = "background:#f44336; color:white; border:1px solid #d32f2f; padding:6px; cursor:pointer; border-radius:3px; font-weight:bold; width:100%; box-sizing:border-box; text-align:center;";

    // Styly pro vizuální zkratky (štítky)
    const activeNav = "display:inline-block; background:#3f51b5; color:white; padding:3px 6px; border-radius:3px; margin:2px; font-weight:bold; font-size:10px; box-shadow:1px 1px 2px rgba(0,0,0,0.3);";
    const activeKey = "display:inline-block; background:#4caf50; color:white; padding:3px 6px; border-radius:3px; margin:2px; font-weight:bold; font-size:10px; box-shadow:1px 1px 2px rgba(0,0,0,0.3);";
    const inactiveKey = "display:inline-block; background:#d3d3d3; color:#777; padding:3px 6px; border-radius:3px; margin:2px; font-weight:bold; font-size:10px; border:1px solid #aaa;";

    // 3. Vytvoření hlavního panelu do DOMu
    let panel = document.createElement('div');
    panel.id = 'dk-help-panel';
    panel.innerHTML = `
        <div style="position:fixed; top:60px; left:10px; background:#fdf2e3; border:2px solid #804000; padding:12px; z-index:10000; border-radius:5px; box-shadow:3px 3px 8px rgba(0,0,0,0.6); font-family:Verdana,Arial,sans-serif; font-size:12px; color:black; width:280px;">
            <h4 style="margin:0 0 8px 0; border-bottom:1px solid #804000; padding-bottom:5px; color:#804000;">HumSterCZ Nástroj v8.5</h4>
            <div style="margin-bottom:5px; font-weight:bold;">Běžící procesy:</div>
            <ul id="dk-active-list" style="margin:0 0 5px 0; padding-left:20px; line-height:1.6; color:#444;"></ul>
            
            <div id="dk-action-container" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px; border-top:1px solid #804000; padding-top:10px;"></div>
            
            <div id="dk-hotkeys-container" style="border-top:1px solid #804000; padding-top:8px; margin-bottom:10px;">
                <div style="font-weight:bold; margin-bottom:5px; color:#804000;">Klávesové zkratky:</div>
                <div style="line-height:1.6;">
                    <span style="${activeNav}" title="Náhled vesnice">[V] Vesnice</span>
                    <span style="${activeNav}" title="Hlavní budova">[H] Hl. budova</span>
                    <span style="${activeNav}" title="Nádvoří">[N] Nádvoří</span>
                    <span style="${activeNav}" title="Rekrutace">[R] Rekrut</span>
                    <span style="${activeNav}" title="Tržiště">[T] Trh</span>
                    <span style="${activeNav}" title="Mapa">[M] Mapa</span>
                </div>
                <div style="line-height:1.6; margin-top:4px;">
                    <span style="${isPlace ? activeKey : inactiveKey}">[F] Fake</span>
                    <span style="${isPlace ? activeKey : inactiveKey}">[S] Špeh</span>
                    <span style="${isPlace ? activeKey : inactiveKey}">[D] Def</span>
                    <span style="${isPlace ? activeKey : inactiveKey}">[Q] Šlechta</span>
                </div>
                <div style="line-height:1.6; margin-top:4px;">
                    <span style="${isFarm ? activeKey : inactiveKey}">[Mezerník] Farm Bot Start/Stop</span>
                </div>
            </div>

            <div style="display:flex; gap:5px; border-top:1px solid #804000; padding-top:10px;">
                <button id="btn-readme" style="flex:1; background:#00bcd4; color:white; border:none; padding:8px 4px; cursor:pointer; border-radius:3px; font-weight:bold; box-shadow:1px 1px 3px rgba(0,0,0,0.4);">Read Me</button>
                <button id="btn-close-help" style="flex:1; background:#f44336; color:white; border:none; padding:8px 4px; cursor:pointer; border-radius:3px; font-weight:bold; box-shadow:1px 1px 3px rgba(0,0,0,0.4);">Skrýt</button>
            </div>
        </div>`;
    document.body.appendChild(panel);

    function addActiveInfo(text) {
        $('#dk-active-list').append(`<li>${text}</li>`);
    }

    // 4. Globální funkce
    initStorageWatcher();
    initSessionGuard();
    initGlobalHotkeys();
    addActiveInfo('Hlídač skladu (pozadí)');
    addActiveInfo('Session Guard (Anti-AFK)');
    
    // 5. Hlavní Router (načítání funkčních tlačítek do Action kontejneru)
    if (isFarm) {
        initFarmBot();
        addActiveInfo('Profi Farm Bot');
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
    } else if (isPlace) {
        initEnhancedPlace();
        addActiveInfo('Rychlé vkládání vojsk');
    } else if (screen === 'main') {
        initBuilderHelper();
        initQueueEstimator();
        addActiveInfo('Pomocník stavitele');
        addActiveInfo('Kalkulátor fronty');
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
        $('#dk-action-container').hide();
    }

    // 6. UI: Read Me okno
    document.getElementById('btn-close-help').addEventListener('click', () => panel.remove());
    document.getElementById('btn-readme').addEventListener('click', () => {
        if(document.getElementById('dk-readme-modal')) return;
        
        let readmeModal = document.createElement('div');
        readmeModal.id = 'dk-readme-modal';
        readmeModal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10005; display:flex; justify-content:center; align-items:center;">
                <div style="background:#fdf2e3; border:3px solid #804000; padding:20px; border-radius:8px; width:90%; max-width:800px; max-height:85vh; overflow-y:auto; box-shadow:0 0 20px rgba(0,0,0,1); font-family:Verdana,Arial,sans-serif; color:black;">
                    <h2 style="color:#804000; border-bottom:2px solid #804000; padding-bottom:10px; margin-top:0;">HumSterCZ Script - Dokumentace modulů</h2>
                    <p style="font-size:13px; line-height:1.5;">Ovládání všech aktivních nástrojů se nachází v hlavním postranním panelu skriptu. Panel se dynamicky mění podle toho, na jaké stránce se zrovna nacházíš. Zkratky se zabarvují podle aktuální dostupnosti.</p>
                    
                    <h3 style="color:#3e2723; margin-bottom:5px;">Klávesové zkratky pro rychlou navigaci (Fungují všude):</h3>
                    <ul style="font-size:13px; line-height:1.6; margin-top:0;">
                        <li><strong>[V]</strong> = Náhled vesnice</li>
                        <li><strong>[H]</strong> = Hlavní budova</li>
                        <li><strong>[N]</strong> = Nádvoří</li>
                        <li><strong>[R]</strong> = Rekrutace</li>
                        <li><strong>[T]</strong> = Tržiště</li>
                        <li><strong>[M]</strong> = Mapa</li>
                    </ul>

                    <h3 style="color:#3e2723; margin-bottom:5px;">Kompletní seznam funkcí a jak fungují:</h3>
                    <ul style="font-size:13px; line-height:1.6; margin-top:0;">
                        <li><strong>Hlídač skladu (Všude):</strong> Běží trvale na pozadí. Automaticky obarví suroviny v horní liště na červeno, jakmile se tvůj sklad zaplní na více než 95 %.</li>
                        <li><strong>Session Guard (Všude):</strong> Pravidelně udržuje aktivní spojení se serverem, čímž zabraňuje vypršení relace (Anti-AFK) při dlouhém čekání nebo farmení.</li>
                        <li><strong>Klávesové zkratky (Nádvoří):</strong> Stiskem [F] vložíš vojsko pro Fake, [S] pro 5 Špehů, [D] pro všechny obranné jednotky a [Q] pro Šlechtu.</li>
                        <li><strong>Klávesové zkratky (Farm Bot):</strong> Stiskem [Mezerníku] v Pomocníkovi rabování bleskově zapneš nebo pozastavíš automatický běh Farm Bota.</li>
                        <li><strong>Farm Bot (Pomocník rabování):</strong> V hlavním panelu nastavíš maximální vzdálenost. Po spuštění projíždí seznam vesnic a rozesílá A nebo B útoky.</li>
                        <li><strong>Časovač útoků / Snipe (Nádvoří - Potvrzení):</strong> Zadej požadovaný čas a milisekundy dopadu. Skript nepřetržitě čte serverový čas a v přesně definovaný moment klikne na odeslat.</li>
                        <li><strong>Detektor vláčků (Náhled - Příchozí):</strong> Pokud zjistí, že 3 a více útoků dopadá ve stejnou vteřinu, podbarví celou skupinu červeně a přidá varovný text [VLÁČEK].</li>
                        <li><strong>Rychlé štítky (Náhled - Příchozí):</strong> Po kliknutí na tlačítko v panelu se u každého útoku objeví tlačítka pro rychlé přejmenování (Šlechta, Beran, Sekera) bez načítání stránky.</li>
                        <li><strong>Profi Razič mincí (Panský dvůr):</strong> Vyhledá odkaz pro vybrání maximálního počtu mincí a následně automaticky potvrdí jejich vyražení napříč tvým impériem.</li>
                        <li><strong>Rychlý Sběr (Nádvoří - Sběr):</strong> Vybere maximální množství volných jednotek a pošle se na průzkum do nejvyšší odemčené úrovně sběru.</li>
                        <li><strong>Rychlé vkládání vojsk (Nádvoří):</strong> Obsahuje 4 tlačítka v panelu (Fake, Špeh, Obrana, Šlechta), která do formuláře pro odeslání rovnou předvyplní příslušné jednotky.</li>
                        <li><strong>Pomocník stavitele (Hlavní budova):</strong> Zaškrtávací pole v hlavním panelu, které vizuálně skryje řádky budov, na které momentálně nemáš dostatek surovin.</li>
                        <li><strong>Kalkulátor fronty (Hlavní budova):</strong> Spočítá a v panelu zobrazí přesný čas v hodinách a minutách, kdy bude dokončena celá aktuální stavební fronta.</li>
                        <li><strong>Hromadná rekrutace (Kasárna/Stáje/Dílna):</strong> Skript automaticky rozpočítá dostupné suroviny do všech políček pro tvorbu jednotek a stiskne tlačítko rekrutovat.</li>
                        <li><strong>Čistič oznámení (Oznámení):</strong> Samočinně vyhledá a zaškrtne všechna oznámení označená zelenou tečkou (farma beze ztrát) a následně je odstraní.</li>
                        <li><strong>Chytré Tržiště (Tržiště):</strong> Zjistí počet volných obchodníků a suroviny k odeslání rozdělí přesně na rovnoměrné třetiny na základě jejich kapacity.</li>
                        <li><strong>Extraktor souřadnic (Mapa/Fórum):</strong> Proskenuje aktuální obrazovku, najde všechny vzory čísel formátu XXX|YYY, odstraní duplicitní záznamy a uloží ti čistý seznam do schránky.</li>
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
    // CORE FUNKCE
    // ==============================================================================

    function initGlobalHotkeys() {
        document.addEventListener('keydown', function(e) {
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            let base = window.game_data ? window.game_data.link_base_pure : null;
            if (base) {
                if(e.key.toLowerCase() === 'v') window.location.href = base + 'overview';
                if(e.key.toLowerCase() === 'h') window.location.href = base + 'main';
                if(e.key.toLowerCase() === 'n') window.location.href = base + 'place';
                if(e.key.toLowerCase() === 'r') window.location.href = base + 'train';
                if(e.key.toLowerCase() === 't') window.location.href = base + 'market';
                if(e.key.toLowerCase() === 'm') window.location.href = base + 'map';
            }

            if(isPlace) {
                if(e.key.toLowerCase() === 'f') $('#btn-fake').click();
                if(e.key.toLowerCase() === 's') $('#btn-spy').click();
                if(e.key.toLowerCase() === 'd') $('#btn-def').click();
                if(e.key.toLowerCase() === 'q') $('#btn-snob').click();
            }
            if(isFarm) {
                if(e.code === 'Space') {
                    e.preventDefault(); 
                    let btnStart = $('#btn-start'), btnStop = $('#btn-stop');
                    if(btnStart.is(':visible') && $('#bot-status').text() === 'Vypnuto') btnStart.click();
                    else btnStop.click();
                }
            }
        });
    }

    function initSessionGuard() {
        // Ochrana proti odhlášení při dlouhé nečinnosti (posílá tiché udržovací požadavky)
        setInterval(() => {
            if (typeof Timing !== 'undefined' && Timing.alive_timer) {
                // Hra má vlastní heartbeat, tohle slouží jako pojistka pro obnovení tokenu
                let pingUrl = window.game_data ? window.game_data.link_base_pure + 'overview' : null;
                if(pingUrl && Math.random() < 0.1) {
                    // Náhodný tichý dotaz na pozadí cca každých 10 minut
                    $.get(pingUrl);
                }
            }
        }, 60000);
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
            <button id="btn-fake" style="${btnStyle}">Fake (F)</button>
            <button id="btn-spy" style="${btnStyleBlue}">5 Špehů (S)</button>
            <button id="btn-def" style="${btnStyle}">Vše do obrany (D)</button>
            <button id="btn-snob" style="${btnStyleOrange}">Šlechta + Doprovod (Q)</button>
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

    function initQueueEstimator() {
        // Kalkulátor stavební fronty - spočítá celkový zbývající čas budov ve frontě
        let totalSeconds = 0;
        $('#build_order tr.command_row').each(function() {
            let timeText = $(this).find('timer').text().trim();
            let parts = timeText.split(':');
            if(parts.length === 3) {
                totalSeconds += parseInt(parts[0])*3600 + parseInt(parts[1])*60 + parseInt(parts[2]);
            }
        });
        if(totalSeconds > 0) {
            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let finishMessage = `Celkem zbývá: ${hours}h ${minutes}m`;
            $('#dk-action-container').append(`<div style="background:#e3c485; border:1px solid #804000; border-radius:3px; padding:6px; text-align:center; font-weight:bold; font-size:11px;">${finishMessage}</div>`);
        }
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
