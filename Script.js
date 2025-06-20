document.addEventListener("DOMContentLoaded", () => {
    // DOM (Belge Nesne Modeli) tamamen yüklendiğinde bu fonksiyon çalışır.
    // Bu, scriptin HTML içeriği hazır olmadan elementlere erişmeye çalışmasını engeller.

    // Mevcut DOM elementleri: HTML sayfasındaki belirli elementlere referanslar alınır.
    const habitInput = document.getElementById("habit-input"); // Alışkanlık adı girişi alanı
    const habitCategory = document.getElementById("habit-category"); // Alışkanlık kategori seçimi alanı
    const addHabitBtn = document.getElementById("add-habit-btn"); // Alışkanlık ekle butonu
    const habitList = document.getElementById("habit-list"); // Alışkanlıkların görüntülendiği liste (ul veya div)
    const formMessage = document.getElementById("form-message"); // Form ile ilgili hata/bilgi mesajlarının gösterileceği alan
    const successMessage = document.getElementById("success-message"); // Başarılı işlemler için gösterilecek mesaj alanı
    const emptyListMessage = document.getElementById("empty-list-message"); // Alışkanlık listesi boşken gösterilen mesaj
    const themeToggle = document.getElementById("theme-toggle"); // Tema değiştirme butonu
    const themeStatus = document.getElementById("theme-status"); // Tema durumunu (Koyu/Açık Mod) gösteren metin

    // Modal ve Linkler: Uygulama içindeki pop-up pencereler (modallar) ve onları tetikleyen linkler.
    const aboutLink = document.getElementById('about-link'); // "Hakkında" modalını açan link
    const aboutModal = document.getElementById('aboutModal'); // "Hakkında" modalının kendisi
    const aboutModalClose = document.getElementById('about-modal-close'); // "Hakkında" modalını kapatma butonu
    const statsLink = document.getElementById('stats-link'); // "İstatistikler" modalını açan link
    const statsModal = document.getElementById('statsModal'); // "İstatistikler" modalının kendisi
    const statsModalClose = document.getElementById('stats-modal-close'); // "İstatistikler" modalını kapatma butonu
    const totalHabitsSpan = document.getElementById('total-habits'); // Toplam alışkanlık sayısının gösterileceği alan
    const completedHabitsSpan = document.getElementById('completed-habits'); // Tamamlanmış alışkanlık sayısının gösterileceği alan
    const pendingHabitsSpan = document.getElementById('pending-habits'); // Bekleyen alışkanlık sayısının gösterileceği alan
    const emptyStatsMessage = document.getElementById('empty-stats-message'); // İstatistikler boşken gösterilen mesaj
    const dailyCompletedCountSpan = document.getElementById('daily-completed-count'); // Günlük tamamlanan alışkanlık sayısının gösterileceği alan
    const longestStreakSpan = document.getElementById('longest-streak'); // En uzun tamamlanma serisinin (streak) gösterileceği alan

    // Takvim DOM elementleri: Takvim arayüzü ile ilgili elementler.
    const calendarGrid = document.getElementById("calendar-grid"); // Takvim günlerinin listelendiği ızgara
    const currentMonthYear = document.getElementById("current-month-year"); // Mevcut ay ve yılın gösterileceği alan
    const prevMonthBtn = document.getElementById("prev-month-btn"); // Önceki aya gitme butonu
    const nextMonthBtn = document.getElementById("next-month-btn"); // Sonraki aya gitme butonu
    const calendarHint = document.querySelector(".calendar-hint"); // Takvimle ilgili ipucu veya talimat mesajı
    const noHabitSelectedMessage = document.getElementById("no-habit-selected-message"); // Alışkanlık seçilmeden takvimde işlem yapılmaya çalışıldığında gösterilen mesaj

    // Grafik DOM elementleri: Aylık tamamlanma grafiği ile ilgili element.
    const monthlyChartContainer = document.getElementById("monthly-chart-container"); // Aylık grafiğin çizileceği kapsayıcı

    // YENİ: Başarılar DOM elementleri: Başarı sistemi ile ilgili elementler.
    const achievementsLink = document.getElementById('achievements-link'); // Başarılar modalını açan link
    const achievementsModal = document.getElementById('achievementsModal'); // Başarılar modalının kendisi
    const achievementsModalClose = document.getElementById('achievements-modal-close'); // Başarılar modalını kapatma butonu
    const achievementsList = document.getElementById('achievements-list'); // Başarı kartlarının listelendiği alan
    const emptyAchievementsMessage = document.getElementById('empty-achievements-message'); // Başarı listesi boşken gösterilen mesaj
    const achievementToast = document.getElementById('achievement-toast'); // Yeni başarı kazanıldığında çıkan kısa bildirim (toast)
    const achievementNameSpan = document.getElementById('achievement-name'); // Bildirimdeki başarı adının gösterileceği alan


    // Uygulama Durumu Değişkenleri
    let habits = loadHabits(); // LocalStorage'dan yüklenen tüm alışkanlıkların dizisi
    let selectedHabitId = null; // Takvimde şu anda seçili olan alışkanlığın ID'si
    let currentCalendarDate = new Date(); // Takvimde şu anda gösterilen ay ve yılın Date objesi
    let userAchievements = loadAchievements(); // YENİ: LocalStorage'dan yüklenen kazanılmış başarıların objesi

    // Önerilen Alışkanlıklar (API Entegrasyonu): Harici bir API'den alışkanlık önerileri almak için.
    const suggestionBtn = document.getElementById('suggestion-btn'); // Öneri alma butonu
    const suggestionText = document.getElementById('suggestion-text'); // API'den gelen öneri metninin gösterileceği alan
    const apiErrorMessage = document.getElementById('api-error-message'); // API'den veri çekerken oluşabilecek hataları gösteren mesaj

    // Harici bir API'den (adviceslip.com) rastgele bir tavsiye/öneri çeken asenkron fonksiyon.
    const fetchSuggestion = async () => {
        suggestionText.textContent = "Öneri yükleniyor..."; // Yükleme mesajı göster
        apiErrorMessage.textContent = ""; // Önceki hata mesajını temizle
        try {
            const response = await fetch("https://api.adviceslip.com/advice"); // API isteği gönder
            if (!response.ok) {
                // HTTP yanıtı başarılı değilse (örn. 404, 500), bir hata fırlat
                throw new Error(`API Hatası: ${response.status}`);
            }
            const data = await response.json(); // Yanıtı JSON olarak ayrıştır
            suggestionText.textContent = data.slip.advice; // Öneriyi DOM'a yerleştir
        } catch (error) {
            console.error("Öneri alınırken hata oluştu:", error); // Hatayı konsola yaz
            suggestionText.textContent = "Üzgünüm, şu an öneri alınamıyor."; // Kullanıcıya genel bir hata mesajı göster
            apiErrorMessage.textContent = "Bağlantı hatası veya sunucuya ulaşılamıyor."; // Daha spesifik bir hata mesajı
        }
    };

    // Öneri butonu tıklama olay dinleyicisi
    suggestionBtn.addEventListener('click', fetchSuggestion);
    // Sayfa yüklendiğinde otomatik olarak ilk öneriyi çek
    fetchSuggestion();

    // Event Listeners (Olay Dinleyicileri): Kullanıcı etkileşimlerini dinleyen kısımlar.
    addHabitBtn.addEventListener("click", addHabit); // Alışkanlık ekle butonuna tıklandığında `addHabit` fonksiyonunu çalıştır
    themeToggle.addEventListener("click", toggleTheme); // Tema değiştirme butonuna tıklandığında `toggleTheme` fonksiyonunu çalıştır
    habitList.addEventListener("click", (e) => {
        // Alışkanlık listesi içindeki tıklamaları yönetir (olay delegasyonu).
        const li = e.target.closest("li"); // Tıklanan elementin en yakın 'li' (liste öğesi) atasını bul
        // Eğer 'li' bulunamazsa veya boş liste mesajı ise işlemi durdur
        if (!li || li.classList.contains("empty-list-message")) return;

        const habitId = li.dataset.id; // Tıklanan 'li' elementinin `data-id` özelliğinden alışkanlık ID'sini al

        if (e.target.type === "checkbox") {
            // Eğer bir checkbox'a tıklandıysa, alışkanlığın genel tamamlanma durumunu değiştir
            toggleHabitCompletion(habitId);
        } else if (e.target.classList.contains("delete-btn") || e.target.closest(".delete-btn")) {
            // Eğer silme butonuna tıklandıysa, alışkanlığı sil
            deleteHabit(habitId);
        } else {
            // Eğer alışkanlık öğesinin kendisine (checkbox veya sil butonu dışındaki bir alana) tıklandıysa
            if (selectedHabitId === habitId) {
                // Eğer zaten seçili olan alışkanlığa tekrar tıklanırsa, seçimi kaldır (toggle)
                selectedHabitId = null;
                renderHabits(); // Alışkanlık listesini yeniden render et (seçili vurgusunu kaldırmak için)
                calendarHint.textContent = "Takvimi görmek için yukarıdan bir alışkanlık seçin."; // Takvim ipucunu orijinaline döndür
                calendarGrid.innerHTML = ""; // Takvimi temizle
                monthlyChartContainer.innerHTML = '<p class="chart-hint">Grafiği görmek için bir alışkanlık seçin.</p>'; // Grafiği temizle
                noHabitSelectedMessage.style.opacity = "0"; // Alışkanlık seçilmedi mesajını gizle
            } else {
                // Yeni bir alışkanlık seçildiyse
                selectedHabitId = habitId; // Seçili alışkanlık ID'sini güncelle
                renderHabits(); // Alışkanlık listesini yeniden render et (yeni seçiliyi vurgulamak için)
                calendarHint.textContent = "Takvimi görmek için bir gün seçin."; // Takvim ipucunu değiştir
                noHabitSelectedMessage.style.opacity = "0"; // Alışkanlık seçilmedi mesajını gizle
                renderCalendar(currentCalendarDate); // Takvimi seçili alışkanlığa göre yeniden render et
                renderMonthlyChart(currentCalendarDate); // Yeni: Aylık grafiği de seçili alışkanlığa göre render et
            }
        }
    });

    // Takvim kontrol butonları için olay dinleyicileri
    prevMonthBtn.addEventListener("click", () => {
        // Önceki ay butonuna tıklandığında
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); // Mevcut ay Date objesinin ayını bir azalt
        renderCalendar(currentCalendarDate); // Takvimi yeni aya göre render et
        renderMonthlyChart(currentCalendarDate); // Yeni: Ay değişince grafiği de güncelle
    });

    nextMonthBtn.addEventListener("click", () => {
        // Sonraki ay butonuna tıklandığında
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); // Mevcut ay Date objesinin ayını bir artır
        renderCalendar(currentCalendarDate); // Takvimi yeni aya göre render et
        renderMonthlyChart(currentCalendarDate); // Yeni: Ay değişince grafiği de güncelle
    });

    // Takvim günü tıklama olayı
    calendarGrid.addEventListener("click", (e) => {
        const dayElement = e.target.closest(".calendar-day"); // Tıklanan elementin en yakın takvim günü elementini bul
        // Eğer bir gün elementi değilse veya boş bir gün ise işlemi durdur
        if (!dayElement || dayElement.classList.contains("empty")) return;

        if (!selectedHabitId) {
            // Eğer takvimde bir gün işaretlenmek isteniyor ama bir alışkanlık seçilmemişse
            showNoHabitSelectedMessage(); // Hata mesajı göster
            return;
        }

        const clickedDay = parseInt(dayElement.querySelector(".day-number").textContent); // Tıklanan günün numarasını al
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const clickedDate = new Date(year, month, clickedDay); // Tıklanan günün tam tarih objesini oluştur

        toggleDailyCompletion(selectedHabitId, clickedDate); // Günlük tamamlanma durumunu değiştir
    });


    // Modallar için olay dinleyicileri: Modalları açma ve kapatma.
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault(); // Varsayılan link (sayfa yenileme) davranışını engelle
        aboutModal.style.display = 'flex'; // "Hakkında" modalını görünür yap (CSS ile)
    });

    aboutModalClose.addEventListener('click', () => {
        aboutModal.style.display = 'none'; // "Hakkında" modalını gizle
    });

    statsLink.addEventListener('click', (e) => {
        e.preventDefault(); // Varsayılan link davranışını engelle
        updateStats(); // İstatistikler modalı açılmadan önce istatistikleri güncelle
        statsModal.style.display = 'flex'; // "İstatistikler" modalını görünür yap
    });

    statsModalClose.addEventListener('click', () => {
        statsModal.style.display = 'none'; // "İstatistikler" modalını gizle
    });

    // YENİ: Başarılar Modalı olay dinleyicileri
    achievementsLink.addEventListener('click', (e) => {
        e.preventDefault(); // Varsayılan link davranışını engelle
        renderAchievements(); // Başarılar modalı açılmadan önce güncel başarıları göster
        achievementsModal.style.display = 'flex'; // Başarılar modalını görünür yap
    });

    achievementsModalClose.addEventListener('click', () => {
        achievementsModal.style.display = 'none'; // Başarılar modalını gizle
    });

    // Modal dışına tıklayınca kapatma
    window.addEventListener('click', (e) => {
        // Eğer tıklanan element 'aboutModal'ın kendisiyse (yani modalın dışı)
        if (e.target == aboutModal) {
            aboutModal.style.display = 'none'; // Hakkında modalını kapat
        }
        // Eğer tıklanan element 'statsModal'ın kendisiyse
        if (e.target == statsModal) {
            statsModal.style.display = 'none'; // İstatistikler modalını kapat
        }
        // Eğer tıklanan element 'achievementsModal'ın kendisiyse
        if (e.target == achievementsModal) {
            achievementsModal.style.display = 'none'; // Başarılar modalını kapat
        }
    });

    // Fonksiyonlar (Uygulamanın temel mantığını içeren yardımcı fonksiyonlar)

    // LocalStorage'dan alışkanlıkları yükler.
    function loadHabits() {
        const storedHabits = localStorage.getItem("habits"); // "habits" anahtarıyla kaydedilmiş veriyi al
        return storedHabits ? JSON.parse(storedHabits) : []; // Eğer veri varsa JSON olarak parse et, yoksa boş bir dizi döndür
    }

    // Alışkanlıkları LocalStorage'a kaydeder.
    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits)); // `habits` dizisini JSON stringine çevirip "habits" anahtarıyla kaydet
    }

    // Başarılı işlem mesajını kısa bir süre gösterip sonra gizler.
    function showSuccessMessage(message) {
        successMessage.textContent = message; // Mesajın içeriğini ayarla
        successMessage.style.opacity = "1"; // Mesajı görünür yap
        successMessage.classList.add("fade-in-out"); // Animasyon sınıfını ekle
        setTimeout(() => {
            successMessage.style.opacity = "0"; // Belirli bir süre sonra gizle
            successMessage.classList.remove("fade-in-out"); // Animasyon sınıfını kaldır
            successMessage.textContent = ""; // Mesaj içeriğini temizle
        }, 3000); // 3 saniye sonra
    }

    // Yeni bir alışkanlık ekler.
    function addHabit(e) {
        e.preventDefault(); // Formun varsayılan gönderme (sayfa yenileme) davranışını engelle

        const habitName = habitInput.value.trim(); // Alışkanlık adını al ve baştaki/sondaki boşlukları temizle
        const category = habitCategory.value; // Seçilen kategori değerini al

        if (habitName === "") {
            // Alışkanlık adı boşsa hata mesajı göster
            formMessage.textContent = "Lütfen geçerli bir alışkanlık girin.";
            formMessage.style.color = "var(--danger)"; // Kırmızı renk
            formMessage.style.opacity = "1"; // Görünür yap
            setTimeout(() => {
                formMessage.style.opacity = "0"; // Bir süre sonra gizle
                formMessage.textContent = ""; // Mesajı temizle
            }, 3000);
            return; // Fonksiyondan çık
        }

        if (category === "") {
            // Kategori seçilmemişse hata mesajı göster
            formMessage.textContent = "Lütfen bir kategori seçin.";
            formMessage.style.color = "var(--danger)";
            formMessage.style.opacity = "1";
            setTimeout(() => {
                formMessage.style.opacity = "0";
                formMessage.textContent = "";
            }, 3000);
            return;
        }

        // Yeni alışkanlık için bir obje oluştur
        const newHabit = {
            id: Date.now().toString(), // Benzersiz bir ID (miliseconds cinsinden zaman damgası)
            name: habitName, // Alışkanlık adı
            category: category, // Alışkanlık kategorisi
            completed: false, // Genel tamamlanma durumu (şimdilik bu projede çok kullanılmıyor, tarih bazlı önemli)
            createdAt: new Date().toISOString(), // Alışkanlığın oluşturulma tarihi (ISO formatında)
            completionDates: {} // Tarih bazlı tamamlanma durumlarını tutan boş obje (örn: {'2023-10-26': true})
        };

        habits.push(newHabit); // Yeni alışkanlığı `habits` dizisine ekle
        saveHabits(); // Alışkanlıkları LocalStorage'a kaydet
        renderHabits(); // Alışkanlık listesini HTML'de yeniden çiz
        habitInput.value = ""; // Giriş alanını temizle
        habitCategory.value = ""; // Kategori seçimini temizle
        formMessage.textContent = ""; // Varsa hata mesajını temizle

        showSuccessMessage("Alışkanlık başarıyla eklendi!"); // Başarılı bildirim göster
        updateStats(); // İstatistikleri güncelle
        checkAchievements(); // YENİ: Başarıları kontrol et (yeni bir alışkanlık eklendiğinde)
    }

    // Bir alışkanlığın genel tamamlanma durumunu (checkbox ile) değiştirir.
    function toggleHabitCompletion(id) {
        // ID'ye göre alışkanlığın dizideki indeksini bul
        const habitIndex = habits.findIndex(habit => habit.id === id);
        if (habitIndex > -1) { // Alışkanlık bulunduysa
            habits[habitIndex].completed = !habits[habitIndex].completed; // `completed` durumunu tersine çevir
            saveHabits(); // Değişikliği kaydet
            renderHabits(); // Listeyi yeniden çiz
            updateStats(); // İstatistikleri güncelle
            if (selectedHabitId === id) {
                // Eğer bu alışkanlık seçili ise, takvimi ve grafiği de güncelle
                renderCalendar(currentCalendarDate);
                renderMonthlyChart(currentCalendarDate);
            }
            checkAchievements(); // YENİ: Başarıları kontrol et
        }
    }

    // Bir alışkanlığı siler.
    function deleteHabit(id) {
        const li = habitList.querySelector(`li[data-id="${id}"]`); // Silinecek 'li' elementini bul
        if (li) {
            li.classList.add('removing'); // Silme animasyonu için sınıf ekle
            // Animasyon bittiğinde gerçek silme işlemini yap
            li.addEventListener('transitionend', () => {
                habits = habits.filter(habit => habit.id !== id); // Alışkanlığı diziden çıkar
                saveHabits(); // Değişikliği kaydet
                renderHabits(); // Listeyi yeniden çiz
                updateStats(); // İstatistikleri güncelle
                if (selectedHabitId === id) {
                    // Eğer silinen alışkanlık seçili ise seçimi kaldır ve takvimi/grafiği temizle
                    selectedHabitId = null;
                    calendarGrid.innerHTML = "";
                    monthlyChartContainer.innerHTML = '<p class="chart-hint">Grafiği görmek için bir alışkanlık seçin.</p>';
                    calendarHint.textContent = "Takvimi görmek için yukarıdan bir alışkanlık seçin.";
                }
                checkAchievements(); // YENİ: Başarıları kontrol et
            });
        }
        showSuccessMessage("Alışkanlık silindi!"); // Başarılı bildirim göster
    }

    // Alışkanlık listesini HTML'de render eder (çizer).
    function renderHabits() {
        habitList.innerHTML = ""; // Mevcut listeyi temizle

        if (habits.length === 0) {
            // Eğer hiç alışkanlık yoksa, boş liste mesajını göster
            emptyListMessage.style.display = "flex";
        } else {
            emptyListMessage.style.display = "none"; // Boş liste mesajını gizle
            habits.forEach(habit => {
                const li = document.createElement("li"); // Her alışkanlık için bir 'li' elementi oluştur
                li.dataset.id = habit.id; // 'li' elementine alışkanlık ID'sini ata
                li.classList.toggle("completed", habit.completed); // `completed` durumuna göre sınıf ekle/kaldır
                li.classList.toggle("selected", habit.id === selectedHabitId); // Seçili alışkanlık sınıfını ekle/kaldır

                const mainContent = document.createElement("div"); // Ana içerik için div
                mainContent.classList.add("habit-main-content");

                const checkbox = document.createElement("input"); // Checkbox oluştur
                checkbox.type = "checkbox";
                checkbox.checked = habit.completed; // Checkbox durumunu ayarla

                const span = document.createElement("span"); // Alışkanlık adı için span
                span.textContent = habit.name;

                const deleteBtn = document.createElement("button"); // Silme butonu oluştur
                deleteBtn.classList.add("delete-btn");
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Sil'; // FontAwesome ikon ve metin

                mainContent.appendChild(checkbox);
                mainContent.appendChild(span);
                mainContent.appendChild(deleteBtn);
                li.appendChild(mainContent); // Ana içeriği 'li'ye ekle

                const metaDiv = document.createElement("div"); // Ek bilgiler için div
                metaDiv.classList.add("habit-meta");

                // Oluşturulma tarihi ve kategori bilgilerini ekle
                const createdAt = new Date(habit.createdAt).toLocaleDateString("tr-TR");
                metaDiv.innerHTML = `
                    <span>Eklendi: ${createdAt}</span>
                    <span>Kategori: ${habit.category ? habit.category.charAt(0).toUpperCase() + habit.category.slice(1) : 'Yok'}</span>
                `;

                const progressContainer = document.createElement("div"); // İlerleme çubuğu kapsayıcısı
                progressContainer.classList.add("progress-bar-container");
                const progressBar = document.createElement("div"); // İlerleme çubuğunun doldurulan kısmı
                progressBar.classList.add("progress-bar-fill");
                // dailyCompletions artık kullanılmadığı için bu progress bar işlevsiz kalabilir.
                // İsteğe bağlı olarak başka bir ilerleme görseli ekleyebilirsiniz.
                progressBar.style.width = `0%`; // Şu an için %0 genişlik
                progressContainer.appendChild(progressBar);

                metaDiv.appendChild(progressContainer);
                li.appendChild(metaDiv); // Meta bilgilerini 'li'ye ekle

                habitList.appendChild(li); // Hazırlanan 'li' elementini listeye ekle
            });
        }
    }

    // İstatistikleri günceller ve istatistikler modalını doldurur.
    function updateStats() {
        if (habits.length === 0) {
            // Eğer alışkanlık yoksa, boş istatistik mesajını göster
            emptyStatsMessage.style.display = 'flex';
            document.getElementById('habit-stats').style.display = 'none'; // İstatistik detaylarını gizle
        } else {
            emptyStatsMessage.style.display = 'none'; // Boş istatistik mesajını gizle
            document.getElementById('habit-stats').style.display = 'block'; // İstatistik detaylarını göster

            const total = habits.length; // Toplam alışkanlık sayısı
            // Genel tamamlanmış alışkanlıklar (şimdilik bu projede genel checkbox için)
            const completed = habits.filter(habit => habit.completed).length;
            const pending = total - completed; // Bekleyen alışkanlık sayısı

            totalHabitsSpan.textContent = total;
            completedHabitsSpan.textContent = completed;
            pendingHabitsSpan.textContent = pending;

            // Günlük istatistikler
            const today = new Date().toISOString().slice(0, 10); // Bugünün tarihini 'YYYY-MM-DD' formatında al
            let todayCompletedCount = 0;
            habits.forEach(habit => {
                // Her alışkanlığın bugünün tarihi için tamamlanma durumunu kontrol et
                if (habit.completionDates && habit.completionDates[today]) {
                    todayCompletedCount++;
                }
            });
            dailyCompletedCountSpan.textContent = todayCompletedCount; // Günlük tamamlanan sayısını güncelle

            // En uzun günlük seriyi bulma (Longest Streak)
            let maxOverallStreak = 0; // Tüm alışkanlıklardaki en uzun seri
            habits.forEach(habit => {
                let currentHabitStreak = 0; // Mevcut alışkanlığın mevcut serisi
                let lastDate = null; // En son tamamlanan tarih
                // Alışkanlığın tamamlanma tarihlerini al ve sırala
                const sortedDates = Object.keys(habit.completionDates || {}).sort();

                sortedDates.forEach(dateStr => {
                    if (habit.completionDates[dateStr]) { // Eğer o gün tamamlanmışsa
                        const currentDate = new Date(dateStr);
                        if (lastDate === null) {
                            currentHabitStreak = 1; // İlk tamamlanma ise seri 1'den başlar
                        } else {
                            // Tarih farkını hesapla (gün olarak)
                            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
                            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays === 1) { // Eğer bir önceki gün ise (seri devam eder)
                                currentHabitStreak++;
                            } else if (diffDays > 1) { // Seri bozulduysa (arada gün atlandıysa)
                                currentHabitStreak = 1; // Seriyi sıfırla ve yeniden başlat
                            } // else: aynı gün ise (diffDays === 0), streak devam eder, bir şey yapmaya gerek yok.
                        }
                        lastDate = currentDate; // Son tarihi güncelle
                    } else {
                        // Eğer o gün tamamlanmamışsa, seri bozulur
                        currentHabitStreak = 0;
                        lastDate = null; // Seriyi sıfırla
                    }
                    if (currentHabitStreak > maxOverallStreak) {
                        maxOverallStreak = currentHabitStreak; // Genel en uzun seriyi güncelle
                    }
                });
            });
            longestStreakSpan.textContent = maxOverallStreak; // En uzun seriyi DOM'a yerleştir
            checkAchievements(); // YENİ: İstatistikler güncellendiğinde başarıları kontrol et
        }
    }

    // Temayı (koyu/açık mod) değiştirir.
    function toggleTheme() {
        document.body.classList.toggle("dark-mode"); // body elementine 'dark-mode' sınıfını ekle/kaldır
        if (document.body.classList.contains("dark-mode")) {
            themeStatus.textContent = "Açık Mod"; // Durum metnini güncelle
            themeToggle.querySelector("i").classList.remove("fa-moon"); // İkonu ay (moon) yerine güneş (sun) yap
            themeToggle.querySelector("i").classList.add("fa-sun");
        } else {
            themeStatus.textContent = "Koyu Mod"; // Durum metnini güncelle
            themeToggle.querySelector("i").classList.remove("fa-sun"); // İkonu güneş (sun) yerine ay (moon) yap
            themeToggle.querySelector("i").classList.add("fa-moon");
        }
        // Tema tercihini LocalStorage'a kaydet
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    }

    // Kaydedilmiş tema tercihini uygular (sayfa yüklendiğinde).
    function applySavedTheme() {
        const savedTheme = localStorage.getItem("theme"); // LocalStorage'dan tema tercihini al
        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode"); // 'dark-mode' sınıfını ekle
            themeStatus.textContent = "Açık Mod";
            themeToggle.querySelector("i").classList.remove("fa-moon");
            themeToggle.querySelector("i").classList.add("fa-sun");
        } else {
            document.body.classList.remove("dark-mode"); // 'dark-mode' sınıfını kaldır
            themeStatus.textContent = "Koyu Mod";
            themeToggle.querySelector("i").classList.remove("fa-sun");
            themeToggle.querySelector("i").classList.add("fa-moon");
        }
    }

    // --- Takvim Fonksiyonları ---

    // Takvimi belirli bir tarihe göre render eder.
    function renderCalendar(date) {
        calendarGrid.innerHTML = ""; // Takvimi temizle
        const year = date.getFullYear(); // Yılı al
        const month = date.getMonth(); // Ayı al (0-11 arası)

        // Mevcut ay ve yılın metin gösterimini güncelle
        currentMonthYear.textContent = new Date(year, month).toLocaleString("tr-TR", { month: "long", year: "numeric" });

        // Ayın ilk gününün haftanın hangi günü olduğunu bul (0: Pazar, 1: Pazartesi...)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        // Takvim ızgarasının Pazartesi'den başlaması için indeks ayarlaması (Pazar 0 ise 6, diğer günler için (day - 1))
        const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Ayın kaç gün olduğunu bul
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Ayın başlangıcındaki boş günleri ekle (geçen aydan kalan günler)
        for (let i = 0; i < startDayIndex; i++) {
            const emptyDay = document.createElement("div");
            emptyDay.classList.add("calendar-day", "empty"); // Boş gün sınıfı
            calendarGrid.appendChild(emptyDay);
        }

        // Ayın günlerini ekle
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add("calendar-day"); // Takvim günü sınıfı
            const dayNumberSpan = document.createElement("span");
            dayNumberSpan.classList.add("day-number");
            dayNumberSpan.textContent = day;
            dayElement.appendChild(dayNumberSpan);

            const currentDate = new Date(year, month, day); // Mevcut günün tarih objesi
            const today = new Date(); // Bugünün tarih objesi

            // Eğer mevcut gün bugün ise 'today' sınıfını ekle
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add("today");
            }

            if (selectedHabitId) {
                // Eğer bir alışkanlık seçili ise, o alışkanlığın bu gün için tamamlanma durumunu kontrol et
                const selectedHabit = habits.find(h => h.id === selectedHabitId);
                if (selectedHabit && selectedHabit.completionDates) {
                    const dateKey = currentDate.toISOString().slice(0, 10); // Tarihi 'YYYY-MM-DD' formatına çevir
                    if (selectedHabit.completionDates[dateKey]) {
                        dayElement.classList.add("selected-habit-completed"); // Tamamlandıysa özel sınıf ekle
                    }
                }
            } else {
                // Eğer alışkanlık seçili değilse, takvim ipucunu göster
                calendarHint.textContent = "Takvimi görmek için yukarıdan bir alışkanlık seçin.";
            }

            calendarGrid.appendChild(dayElement); // Günü takvim ızgarasına ekle
        }
    }

    // Bir alışkanlığın belirli bir gün için tamamlanma durumunu değiştirir.
    function toggleDailyCompletion(habitId, date) {
        const habit = habits.find(h => h.id === habitId); // İlgili alışkanlığı bul
        if (!habit) return; // Alışkanlık bulunamazsa çık

        const dateKey = date.toISOString().slice(0, 10); // Tarihi 'YYYY-MM-DD' formatına çevir

        if (!habit.completionDates) {
            habit.completionDates = {}; // completionDates objesi yoksa oluştur
        }

        // Tamamlanma durumunu tersine çevir (true ise false, false/undefined ise true yapar)
        habit.completionDates[dateKey] = !habit.completionDates[dateKey];

        saveHabits(); // Değişikliği kaydet
        renderHabits(); // Alışkanlık listesini yeniden çiz
        renderCalendar(currentCalendarDate); // Takvimi yeniden çiz
        renderMonthlyChart(currentCalendarDate); // Aylık grafiği yeniden çiz
        updateStats(); // İstatistikleri güncelle
        checkAchievements(); // YENİ: Başarıları kontrol et
    }

    // Alışkanlık seçilmeden takvimde işlem yapılmaya çalışıldığında uyarı mesajı gösterir.
    function showNoHabitSelectedMessage(message = "Takvimde bir günü işaretlemek için önce bir alışkanlık seçmelisiniz.") {
        noHabitSelectedMessage.textContent = message; // Mesajın içeriğini ayarla
        noHabitSelectedMessage.style.opacity = "1"; // Görünür yap
        setTimeout(() => {
            noHabitSelectedMessage.style.opacity = "0"; // Bir süre sonra gizle
            noHabitSelectedMessage.textContent = ""; // Mesajı temizle
        }, 3000);
    }

    // --- Aylık Çubuk Grafik Fonksiyonu ---

    // Belirli bir ay için alışkanlığın tamamlanma durumlarını çubuk grafik olarak gösterir.
    function renderMonthlyChart(date) {
        monthlyChartContainer.innerHTML = ''; // Grafiği temizle

        if (!selectedHabitId) {
            monthlyChartContainer.innerHTML = '<p class="chart-hint">Grafiği görmek için bir alışkanlık seçin.</p>'; // Alışkanlık seçilmedi mesajı
            return;
        }

        const selectedHabit = habits.find(h => h.id === selectedHabitId); // Seçili alışkanlığı bul
        if (!selectedHabit || !selectedHabit.completionDates) {
            monthlyChartContainer.innerHTML = '<p class="chart-hint">Bu alışkanlık için henüz tamamlanma verisi yok.</p>'; // Veri yoksa mesaj
            return;
        }

        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Ayın gün sayısını al

        // Ayın her günü için bir çubuk oluştur
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateKey = dateObj.toISOString().slice(0, 10); // 'YYYY-MM-DD' formatı
            const isCompleted = selectedHabit.completionDates[dateKey] || false; // O gün tamamlandı mı?

            const bar = document.createElement('div');
            bar.classList.add('chart-bar'); // Çubuk sınıfı
            bar.style.height = isCompleted ? '100%' : '10%'; // Tamamlandıysa %100, tamamlanmadıysa %10 yükseklik
            if (isCompleted) {
                bar.classList.add('completed'); // Tamamlandıysa 'completed' sınıfı ekle
            }

            const dayLabel = document.createElement('span'); // Gün numarası etiketi
            dayLabel.classList.add('day-label');
            dayLabel.textContent = day;
            bar.appendChild(dayLabel);

            const tooltip = document.createElement('span'); // Tooltip (ipucu kutusu)
            tooltip.classList.add('tooltip');
            tooltip.textContent = isCompleted ? 'Tamamlandı' : 'Tamamlanmadı';
            bar.appendChild(tooltip);

            monthlyChartContainer.appendChild(bar); // Çubuğu grafik kapsayıcısına ekle
        }
    }

    // --- YENİ: Başarılar Sistemi Fonksiyonları ---

    // Tüm başarıların tanımlandığı dizi. Her başarı bir obje olarak tutulur.
    const allAchievements = [
        { id: 'first_habit', name: 'İlk Adım', description: 'İlk alışkanlığını ekle', icon: 'fas fa-seedling', check: (habits, userAchievements) => habits.length >= 1 },
        { id: 'master_planner', name: 'Planlama Ustası', description: '5 alışkanlık ekle', icon: 'fas fa-tasks', check: (habits, userAchievements) => habits.length >= 5 },
        { id: 'habit_hero', name: 'Alışkanlık Kahramanı', description: '10 alışkanlık ekle', icon: 'fas fa-star-of-life', check: (habits, userAchievements) => habits.length >= 10 },
        { id: 'first_completion', name: 'İlk Tamamlanma', description: 'İlk alışkanlığını tamamla', icon: 'fas fa-clipboard-check', check: (habits, userAchievements) => habits.some(h => Object.values(h.completionDates || {}).some(status => status)) },
        { id: 'three_day_streak', name: '3 Günlük Seri', description: 'Bir alışkanlıkta 3 gün üst üste tamamla', icon: 'fas fa-fire', check: (habits, userAchievements) => getHighestStreak(habits) >= 3 },
        { id: 'seven_day_streak', name: '7 Günlük Seri', description: 'Bir alışkanlıkta 7 gün üst üste tamamla', icon: 'fas fa-bolt', check: (habits, userAchievements) => getHighestStreak(habits) >= 7 },
        { id: 'thirty_day_streak', name: '30 Günlük Seri', description: 'Bir alışkanlıkta 30 gün üst üste tamamla', icon: 'fas fa-trophy', check: (habits, userAchievements) => getHighestStreak(habits) >= 30 },
        { id: 'ten_completed_tasks', name: 'On Başarı', description: 'Toplam 10 günlük alışkanlık tamamlama', icon: 'fas fa-medal', check: (habits, userAchievements) => getTotalDailyCompletions(habits) >= 10 },
        { id: 'fifty_completed_tasks', name: 'Elli Başarı', description: 'Toplam 50 günlük alışkanlık tamamlama', icon: 'fas fa-crown', check: (habits, userAchievements) => getTotalDailyCompletions(habits) >= 50 },
    ];

    // LocalStorage'dan kazanılmış başarıları yükler.
    function loadAchievements() {
        const storedAchievements = localStorage.getItem("userAchievements"); // "userAchievements" anahtarıyla kaydedilmiş veriyi al
        return storedAchievements ? JSON.parse(storedAchievements) : {}; // Eğer veri varsa parse et, yoksa boş bir obje döndür
    }

    // Kazanılmış başarıları LocalStorage'a kaydeder.
    function saveAchievements() {
        localStorage.setItem("userAchievements", JSON.stringify(userAchievements)); // `userAchievements` objesini stringe çevirip kaydet
    }

    // Başarıların kazanılıp kazanılmadığını kontrol eder ve gerekirse başarıları günceller.
    function checkAchievements() {
        let newAchievementUnlocked = false; // Yeni başarı kazanılıp kazanılmadığını takip eden bayrak
        allAchievements.forEach(achievement => {
            if (!userAchievements[achievement.id]) { // Eğer bu başarı henüz kazanılmamışsa
                if (achievement.check(habits, userAchievements)) { // Başarının kazanılma koşulu sağlanıyorsa (`check` fonksiyonu)
                    userAchievements[achievement.id] = true; // Başarıyı kazanıldı olarak işaretle
                    showAchievementToast(achievement.name); // Başarı bildirimini göster
                    newAchievementUnlocked = true; // Yeni başarı kazanıldı bayrağını true yap
                }
            }
        });
        if (newAchievementUnlocked) {
            saveAchievements(); // Yeni başarılar varsa kaydet
            renderAchievements(); // Başarılar modalını da güncelle
        }
    }

    // Başarılar listesini HTML'de render eder.
    function renderAchievements() {
        achievementsList.innerHTML = ''; // Listeyi temizle

        if (Object.keys(userAchievements).length === 0 && habits.length === 0) { // Hiç alışkanlık yoksa ve başarı yoksa
            emptyAchievementsMessage.style.display = 'block'; // Boş başarı mesajını göster
        } else {
            emptyAchievementsMessage.style.display = 'none'; // Mesajı gizle
        }

        allAchievements.forEach(achievement => {
            const achievementCard = document.createElement('div'); // Her başarı için bir kart oluştur
            achievementCard.classList.add('achievement-card');

            const isUnlocked = userAchievements[achievement.id]; // Bu başarı kazanıldı mı?
            if (!isUnlocked) {
                achievementCard.classList.add('locked'); // Kazanılmadıysa 'locked' sınıfı ekle
            }

            // Kartın HTML içeriğini oluştur (ikon, ad, açıklama)
            achievementCard.innerHTML = `
                <i class="${achievement.icon}"></i>
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            `;
            achievementsList.appendChild(achievementCard); // Kartı listeye ekle
        });
    }

    // Yeni başarı kazanıldığında çıkan bildirim (toast) mesajını gösterir.
    function showAchievementToast(name) {
        achievementNameSpan.textContent = name; // Bildirimdeki başarı adını ayarla
        achievementToast.classList.add('show'); // 'show' sınıfını ekleyerek görünür yap
        setTimeout(() => {
            achievementToast.classList.remove('show'); // Belirli bir süre sonra gizle
        }, 4000); // 4 saniye sonra kaybolur
    }

    // Yardımcı fonksiyon: Tüm alışkanlıklar arasında en yüksek günlük seriyi (streak) hesaplar.
    function getHighestStreak(habitsArr) {
        let maxOverallStreak = 0; // Genel en yüksek seri
        habitsArr.forEach(habit => {
            let currentHabitStreak = 0; // Mevcut alışkanlığın mevcut serisi
            let lastDate = null; // En son tamamlanan tarih
            // Alışkanlığın tamamlanma tarihlerini al ve kronolojik olarak sırala
            const sortedDates = Object.keys(habit.completionDates || {}).sort();

            sortedDates.forEach(dateStr => {
                if (habit.completionDates[dateStr]) { // Eğer o gün tamamlanmışsa
                    const currentDate = new Date(dateStr);
                    if (lastDate === null) {
                        currentHabitStreak = 1; // İlk tamamlanma ise seri 1'den başlar
                    } else {
                        // Tarih farkını gün olarak hesapla
                        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) {
                            currentHabitStreak++; // Bir önceki gün ise seriyi artır
                        } else if (diffDays > 1) {
                            currentHabitStreak = 1; // Seri bozulduysa sıfırla ve yeniden başlat
                        }
                    }
                    lastDate = currentDate; // Son tamamlanan tarihi güncelle
                } else {
                    currentHabitStreak = 0; // Tamamlanmadıysa seriyi sıfırla
                    lastDate = null;
                }
                if (currentHabitStreak > maxOverallStreak) {
                    maxOverallStreak = currentHabitStreak; // Genel en yüksek seriyi güncelle
                }
            });
        });
        return maxOverallStreak; // En yüksek seriyi döndür
    }

    // Yardımcı fonksiyon: Tüm alışkanlıklardaki toplam günlük tamamlanma sayısını hesaplar.
    function getTotalDailyCompletions(habitsArr) {
        let totalCompletions = 0;
        habitsArr.forEach(habit => {
            for (const dateKey in habit.completionDates) {
                if (habit.completionDates[dateKey]) { // Eğer o gün tamamlanmışsa
                    totalCompletions++; // Sayacı artır
                }
            }
        });
        return totalCompletions; // Toplam tamamlanma sayısını döndür
    }


    // Uygulama başlatma: Sayfa yüklendiğinde çalışacak başlangıç fonksiyonları.
    applySavedTheme(); // Kaydedilmiş temayı uygula
    renderHabits(); // Alışkanlıkları listele
    updateStats(); // İstatistikleri güncelle
    checkAchievements(); // Mevcut başarıları kontrol et ve gerekirse başarıları aç
    // renderCalendar(currentCalendarDate); // Takvimin ilk başta boş olması istendiği için yorum satırı yapıldı
    // renderMonthlyChart(currentCalendarDate); // Grafiğin ilk başta boş olması istendiği için yorum satırı yapıldı
});