/* ============================================================
   THE GRAND LIBRARY
   MAIN APPLICATION
   ============================================================ */

"use strict";


/* ============================================================
   CONFIGURATION
   ============================================================ */

const CONFIG = {
    api: "https://openlibrary.org/search.json",

    covers: "https://covers.openlibrary.org/b/id/",

    resultsPerRequest: 12,

    featuredSubjects: [
        "fiction",
        "science",
        "computer science",
        "history"
    ],

    categories: {
        novels: {
            title: "Novels",
            subject: "fiction",
            description:
                "Stories that transport you somewhere else."
        },

        ai: {
            title: "Artificial Intelligence",
            subject: "artificial intelligence",
            description:
                "Machines, intelligence and the future."
        },

        law: {
            title: "Law",
            subject: "law",
            description:
                "Justice, rights, constitutions and society."
        },

        science: {
            title: "Science",
            subject: "science",
            description:
                "Explore the universe and everything within it."
        },

        programming: {
            title: "Programming",
            subject: "computer programming",
            description:
                "Build, code and understand the digital world."
        },

        history: {
            title: "History",
            subject: "history",
            description:
                "Discover the people and events that shaped our world."
        },

        philosophy: {
            title: "Philosophy",
            subject: "philosophy",
            description:
                "Questions about existence, knowledge and meaning."
        },

        psychology: {
            title: "Psychology",
            subject: "psychology",
            description:
                "Explore the human mind and behaviour."
        }
    }
};


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {

    currentRoute: "/",

    currentSearch: "",

    currentCategory: null,

    searchTimeout: null,

    favorites:
        JSON.parse(
            localStorage.getItem("grandLibraryFavorites") || "[]"
        ),

    searchResults: [],

    featuredBooks: [],

    popularBooks: []

};


/* ============================================================
   DOM HELPERS
   ============================================================ */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    [...document.querySelectorAll(selector)];


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const elements = {

    app: $("#app"),

    featuredBooks: $("#featuredBooks"),

    popularBooks: $("#popularBooks"),

    heroSearch: $("#heroSearch"),

    searchOverlay: $("#searchOverlay"),

    globalSearch: $("#globalSearch"),

    searchResults: $("#searchResults"),

    closeSearch: $(".close-search"),

    searchButton: $(".search-button"),

    toast: $("#libraryToast"),

    toastMessage: $(".toast-message")

};


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeLibrary
);


async function initializeLibrary() {

    setupNavigation();

    setupSearch();

    setupKeyboardShortcuts();

    setupCategoryLinks();

    updateActiveNavigation();

    await loadHomeBooks();

}


/* ============================================================
   NAVIGATION
   ============================================================ */

function setupNavigation() {

    window.addEventListener(
        "hashchange",
        handleRoute
    );

    handleRoute();

}


async function handleRoute() {

    const route =
        window.location.hash.replace("#", "") || "/";

    state.currentRoute = route;

    updateActiveNavigation();


    if (
        route === "/" ||
        route === ""
    ) {

        await loadHomeBooks();

        return;
    }


    if (route === "/explore") {

        await showExplorePage();

        return;
    }


    if (route === "/categories") {

        showCategoriesPage();

        return;
    }


    if (route === "/shelf") {

        showShelfPage();

        return;
    }


    if (route.startsWith("/novels")) {

        await showCategoryPage("novels");

        return;
    }


    if (route.startsWith("/ai")) {

        await showCategoryPage("ai");

        return;
    }


    if (route.startsWith("/law")) {

        await showCategoryPage("law");

        return;
    }


    if (route.startsWith("/science")) {

        await showCategoryPage("science");

        return;
    }


    if (route.startsWith("/programming")) {

        await showCategoryPage("programming");

        return;
    }


    if (route.startsWith("/history")) {

        await showCategoryPage("history");

        return;
    }


    if (route.startsWith("/philosophy")) {

        await showCategoryPage("philosophy");

        return;
    }


    if (route.startsWith("/psychology")) {

        await showCategoryPage("psychology");

        return;
    }


    if (route === "/about") {

        showSimplePage(
            "About the Library",
            "A digital sanctuary for discovering books and ideas."
        );

        return;
    }


    if (route === "/authors") {

        showSimplePage(
            "Authors",
            "Discover writers and thinkers from around the world."
        );

        return;
    }


    if (route === "/help") {

        showSimplePage(
            "Help",
            "Search, explore and build your personal shelf."
        );

        return;
    }


    showNotFound();

}


/* ============================================================
   ACTIVE NAVIGATION
   ============================================================ */

function updateActiveNavigation() {

    $$(".nav-link").forEach(link => {

        const href =
            link.getAttribute("href");

        link.classList.toggle(
            "active",
            href === #${state.currentRoute}
        );

    });

}


/* ============================================================
   HOME
   ============================================================ */

async function loadHomeBooks() {

    if (!elements.featuredBooks) {
        return;
    }


    renderBookSkeletons(
        elements.featuredBooks,
        4
    );


    try {

        const books =
            await searchBooks(
                "fiction",
                4
            );


        state.featuredBooks = books;


        renderBooks(
            elements.featuredBooks,
            books
        );


    } catch (error) {

        renderError(
            elements.featuredBooks,
            "The shelves are temporarily unavailable."
        );

    }


    if (elements.popularBooks) {

        renderBookSkeletons(
            elements.popularBooks,
            5
        );


        try {

            const books =
                await searchBooks(
                    "bestseller",
                    8
                );


            state.popularBooks = books;


            renderHorizontalBooks(
                elements.popularBooks,
                books
            );


        } catch {

            renderError(
                elements.popularBooks,
                "Unable to load this collection."
            );

        }

    }


    setupBookInteractions();

}


/* ============================================================
   OPEN LIBRARY SEARCH
   ============================================================ */

async function searchBooks(
    query,
    limit = CONFIG.resultsPerRequest
) {

    const url =
        new URL(CONFIG.api);


    url.searchParams.set(
        "q",
        query
    );


    url.searchParams.set(
        "limit",
        limit
    );


    url.searchParams.set(
        "fields",
        [
            "key",
            "title",
            "author_name",
            "cover_i",
            "first_publish_year",
            "subject",
            "isbn",
            "publisher",
            "edition_key"
        ].join(",")
    );


    const response =
        await fetch(
            url.toString()
        );


    if (!response.ok) {

        throw new Error(
            "Book service unavailable"
        );

    }


    const data =
        await response.json();


    return (
        data.docs || []
    ).filter(
        book =>
            book.title
    );

}


/* ============================================================
   BOOK DATA NORMALIZATION
   ============================================================ */

function normalizeBook(book) {

    const cover =
        book.cover_i
            ? ${CONFIG.covers}${book.cover_i}-M.jpg
            : createFallbackCover(
                book.title
            );


    const author =
        book.author_name?.[0]
        || "Unknown author";


    const year =
        book.first_publish_year
        || "Unknown year";


    const subjects =
        book.subject
        || [];


    return {

        id:
            book.key
            || ${book.title}-${author},

        title:
            book.title,

        author,

        year,

        cover,

        subjects,

        isbn:
            book.isbn?.[0]
            || null,

        publisher:
            book.publisher?.[0]
            || null

    };

}


/* ============================================================
   COVER FALLBACK
   ============================================================ */

function createFallbackCover(title) {

    const safeTitle =
        encodeURIComponent(
            title || "Unknown Book"
        );


    return (
        "https://placehold.co/500x750/15151b/" +
        "d7b56d?text=" +
        safeTitle
    );

}


/* ============================================================
   BOOK GRID
   ============================================================ */

function renderBooks(
    container,
    books
) {

    if (!container) {
        return;
    }


    if (!books.length) {

        container.innerHTML = 
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <h3>No books found</h3>
                <p>Try exploring another part of the library.</p>
            </div>
        ;

        return;
    }


    container.innerHTML =
        books
            .map(normalizeBook)
            .map(createBookCard)
            .join("");


    setupBookInteractions();

}


/* ============================================================
   HORIZONTAL BOOKS
   ============================================================ */

function renderHorizontalBooks(
    container,
    books
) {

    if (!container) {
        return;
    }


    if (!books.length) {

        container.innerHTML = 
            <div class="empty-state">
                <p>No books available right now.</p>
            </div>
        ;

        return;
    }


    container.innerHTML =
        books
            .map(normalizeBook)
            .map(
                book =>
                    createHorizontalBookCard(
                        book
                    )
            )
            .join("");


    setupBookInteractions();

}


/* ============================================================
   BOOK CARD
   ============================================================ */

function createBookCard(book) {

    const favorite =
        state.favorites.includes(
            book.id
        );


    return 
        <article
            class="book-card"
            data-book-id="${escapeHTML(book.id)}"
            data-title="${escapeHTML(book.title)}"
        >

            <div class="book-cover">

                <img
                    src="${escapeHTML(book.cover)}"
                    alt="${escapeHTML(book.title)} cover"
                    loading="lazy"
                    onerror="this.src='${createFallbackCover(book.title)}'"
                >

                <button
                    class="book-favorite ${favorite ? "saved" : ""}"
                    type="button"
                    data-favorite="${escapeHTML(book.id)}"
                    aria-label="Save ${escapeHTML(book.title)}"
                >
                    ${favorite ? "♥" : "♡"}
                </button>

                <div class="book-cover-shine"></div>

            </div>

            <div class="book-information">

                <h3 title="${escapeHTML(book.title)}">
                    ${escapeHTML(book.title)}
                </h3>

                <p>
                    ${escapeHTML(book.author)}
                    ${book.year !== "Unknown year"
                        ?  · ${escapeHTML(String(book.year))}
                        : ""}
                </p>

            </div>

        </article>
    ;

}


/* ============================================================
   HORIZONTAL BOOK CARD
   ============================================================ */

function createHorizontalBookCard(book) {

    const favorite =
        state.favorites.includes(
            book.id
        );


    return 
        <article
            class="book-card horizontal-book"
            data-book-id="${escapeHTML(book.id)}"
        >

            <div class="book-cover">

                <img
                    src="${escapeHTML(book.cover)}"
                    alt="${escapeHTML(book.title)} cover"
                    loading="lazy"
                    onerror="this.src=${createFallbackCover(book.title)}'"
                >

                <button
                    class="book-favorite ${favorite ? "saved" : ""}"
                    type="button"
                    data-favorite="${escapeHTML(book.id)}"
                >
                    ${favorite ? "♥" : "♡"}
                </button>

            </div>

            <div class="book-information">

                <h3>
                    ${escapeHTML(book.title)}
                </h3>

                <p>
                    ${escapeHTML(book.author)}
                </p>

            </div>

        </article>
    ;

}


/* ============================================================
   BOOK INTERACTIONS
   ============================================================ */

function setupBookInteractions() {

    $$(".book-card").forEach(card => {

        if (
            card.dataset.listenersAttached
        ) {
            return;
        }


        card.dataset.listenersAttached =
            "true";


        card.addEventListener(
            "click",
            event => {

                const favoriteButton =
                    event.target.closest(
                        "[data-favorite]"
                    );


                if (favoriteButton) {

                    event.stopPropagation();

                    toggleFavorite(
                        favoriteButton.dataset.favorite
                    );

                    return;
                }


                const id =
                    card.dataset.bookId;


                const book =
                    findBookById(id);


                if (book) {

                    showBookDetails(
                        book
                    );

                }

            }
        );

    });

}


/* ============================================================
   FIND BOOK
   ============================================================ */

function findBookById(id) {

    const allBooks = [
        ...state.featuredBooks,
        ...state.popularBooks,
        ...state.searchResults
    ];


    const book =
        allBooks
            .map(normalizeBook)
            .find(
                item =>
                    item.id === id
            );


    return book || null;

}


/* ============================================================
   FAVORITES
   ============================================================ */

function toggleFavorite(id) {

    const index =
        state.favorites.indexOf(id);


    if (index === -1) {

        state.favorites.push(id);

        showToast(
            "Added to your shelf ✦"
        );

    } else {

        state.favorites.splice(
            index,
            1
        );

        showToast(
            "Removed from your shelf"
        );

    }


    localStorage.setItem(
        "grandLibraryFavorites",
        JSON.stringify(
            state.favorites
        )
    );


    refreshVisibleFavoriteButtons();

}


function refreshVisibleFavoriteButtons() {

    $$("[data-favorite]").forEach(
        button => {

            const saved =
                state.favorites.includes(
                    button.dataset.favorite
                );


            button.classList.toggle(
                "saved",
                saved
            );


            button.textContent =
                saved
                    ? "♥"
                    : "♡";

        }
    );

}


/* ============================================================
   SEARCH SYSTEM
   ============================================================ */

function setupSearch() {

    if (elements.searchButton) {

        elements.searchButton.addEventListener(
            "click",
            openSearch
        );

    }


    if (elements.closeSearch) {

        elements.closeSearch.addEventListener(
            "click",
            closeSearch
        );

    }


    if (elements.searchOverlay) {

        elements.searchOverlay
            .querySelector(
                ".search-overlay-backdrop"
            )
            ?.addEventListener(
                "click",
                closeSearch
            );

    }


    if (elements.heroSearch) {

        elements.heroSearch.addEventListener(
            "focus",
            openSearch
        );


        elements.heroSearch.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    openSearch();

                    performSearch(
                        elements.heroSearch.value
                    );

                }

            }
        );

    }


    if (elements.globalSearch) {

        elements.globalSearch.addEventListener(
            "input",
            event => {

                const query =
                    event.target.value.trim();


                clearTimeout(
                    state.searchTimeout
                );


                state.searchTimeout =
                    setTimeout(
                        () =>
                            performSearch(
                                query
                            ),
                        350
                    );

            }
        );

    }


    $$(".search-suggestions button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const query =
                        button.textContent.trim();


                    openSearch();


                    elements.globalSearch.value =
                        query;


                    performSearch(
                        query
                    );

                }
            );

        });

}


function openSearch() {

    if (!elements.searchOverlay) {
        return;
    }


    elements.searchOverlay.classList.add(
        "visible"
    );


    elements.searchOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(
        () =>
            elements.globalSearch?.focus(),
        100
    );

}


function closeSearch() {

    if (!elements.searchOverlay) {
        return;
    }


    elements.searchOverlay.classList.remove(
        "visible"
    );


    elements.searchOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ============================================================
   PERFORM SEARCH
   ============================================================ */

async function performSearch(
    query
) {

    if (!elements.searchResults) {
        return;
    }


    if (!query) {

        elements.searchResults.innerHTML = 
            <div class="search-empty">
                <span>✦</span>
                <p>Search the library to begin.</p>
            </div>
        ;

        return;
    }


    elements.searchResults.innerHTML = 
        <div class="search-loading">
            <span></span>
            <span></span>
            <span></span>
            <p>Opening the catalogue...</p>
        </div>
    ;


    try {

        const books =
            await searchBooks(
                query,
                12
            );


        state.searchResults =
            books;


        if (!books.length) {

            elements.searchResults.innerHTML = 
                <div class="search-empty">
                    <span>◌</span>
                    <h3>No books found</h3>
                    <p>
                        Try another title, author or subject.
                    </p>
                </div>
            ;

            return;
        }


        elements.searchResults.innerHTML =
            books
                .map(normalizeBook)
                .map(
                    createSearchResult
                )
                .join("");


        setupSearchResultInteractions();

    } catch {

        elements.searchResults.innerHTML = 
            <div class="search-empty">
                <span>!</span>
                <h3>The catalogue is resting</h3>
                <p>
                    Please try your search again in a moment.
                </p>
            </div>
        ;

    }

}


/* ============================================================
   SEARCH RESULT
   ============================================================ */

function createSearchResult(book) {

    const saved =
        state.favorites.includes(
            book.id
        );


    return 
        <article
            class="search-result"
            data-search-book="${escapeHTML(book.id)}"
        >

            <img
                src="${escapeHTML(book.cover)}"
                alt="${escapeHTML(book.title)} cover"
                loading="lazy"
                onerror="this.src='${createFallbackCover(book.title)}'"
            >

            <div class="search-result-info">

                <h3>
                    ${escapeHTML(book.title)}
                </h3>

                <p>
                    ${escapeHTML(book.author)}
                </p>

                <small>
                    ${escapeHTML(String(book.year))}
                </small>

            </div>

            <button
                type="button"
                class="search-save ${saved ? "saved" : ""}"
                data-search-favorite="${escapeHTML(book.id)}"
            >
                ${saved ? "♥ Saved" : "♡ Save"}
            </button>

        </article>
    ;

}


/* ============================================================
   SEARCH RESULT INTERACTIONS
   ============================================================ */

function setupSearchResultInteractions() {

    $$(".search-result").forEach(
        result => {

            result.addEventListener(
                "click",
                event => {

                    const saveButton =
                        event.target.closest(
                            "[data-search-favorite]"
                        );


                    if (saveButton) {

                        event.stopPropagation();

                        toggleFavorite(
                            saveButton.dataset.searchFavorite
                        );

                        saveButton.classList.toggle(
                            "saved",
                            state.favorites.includes(
                                saveButton.dataset.searchFavorite
                            )
                        );

                        saveButton.textContent =
                            state.favorites.includes(
                                saveButton.dataset.searchFavorite
                            )
                                ? "♥ Saved"
                                : "♡ Save";

                        return;
                    }


                    const id =
                        result.dataset.searchBook;


                    const book =
                        findBookById(id);


                    if (book) {

                        closeSearch();

                        showBookDetails(
                            book
                        );

                    }

                }
            );

        }
    );

}


/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            const modifier =
                event.ctrlKey ||
                event.metaKey;


            if (
                modifier &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                openSearch();

            }


            if (
                event.key === "Escape"
            ) {

                closeSearch();

            }

        }
    );

}


/* ============================================================
   CATEGORY LINKS
   ============================================================ */

function setupCategoryLinks() {

    $$(".category-card").forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const href =
                        card.getAttribute(
                            "href"
                        );


                    if (href) {

                        window.location.hash =
                            href.replace("#", "");

                    }

                }
            );

        }
    );

}


/* ============================================================
   CATEGORY PAGE
   ============================================================ */

async function showCategoryPage(
    categoryKey
) {

    const category =
        CONFIG.categories[
            categoryKey
        ];


    if (!category) {

        showNotFound();

        return;

    }


    state.currentCategory =
        categoryKey;


    renderCategoryShell(
        category
    );


    const container =
        $("#categoryBooks");


    renderBookSkeletons(
        container,
        8
    );


    try {

        const books =
            await searchBooks(
                category.subject,
                16
            );


        state.searchResults =
            books;


        renderBooks(
            container,
            books
        );


    } catch {

        renderError(
            container,
            "This room could not be opened right now."
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   CATEGORY SHELL
   ============================================================ */

function renderCategoryShell(
    category
) {

    elements.app.innerHTML = 

        <section class="category-page">

            <div class="category-page-hero">

                <span class="section-kicker">
                    THE LIBRARY · COLLECTION
                </span>

                <h1>
                    ${escapeHTML(category.title)}
                </h1>

                <p>
                    ${escapeHTML(category.description)}
                </p>

                <div class="category-page-line"></div>

            </div>

            <section class="library-section">

                <div class="section-heading">

                    <div>
                        <span class="section-kicker">
                            CURATED COLLECTION
                        </span>

                        <h2>
                            Books to explore
                        </h2>
                    </div>

                    <a
                        href="#/categories"
                        class="text-link"
                    >
                        All categories
                        <span>→</span>
                    </a>

                </div>

                <div
                    class="book-grid"
                    id="categoryBooks"
                ></div>

            </section>

        </section>

    ;

}


/* ============================================================
   EXPLORE PAGE
   ============================================================ */

async function showExplorePage() {

    elements.app.innerHTML = 

        <section class="explore-page">

            <div class="category-page-hero">

                <span class="section-kicker">
                    THE CATALOGUE
                </span>

                <h1>
                    Explore the Library
                </h1>

                <p>
                    Search through books from countless subjects,
                    authors and collections.
                </p>

                <div class="hero-search explore-search">

                    <span class="search-symbol">
                        ⌕
                    </span>

                    <input
                        id="exploreSearch"
                        type="search"
                        placeholder="Search the catalogue..."
                    >

                </div>

            </div>

            <section class="library-section">

                <div class="section-heading">

                    <div>
                        <span class="section-kicker">
                            DISCOVER
                        </span>

                        <h2>
                            Start exploring
                        </h2>
                    </div>

                </div>

                <div
                    class="book-grid"
                    id="exploreBooks"
                ></div>

            </section>

        </section>

    ;


    const input =
        $("#exploreSearch");


    const container =
        $("#exploreBooks");


    renderBookSkeletons(
        container,
        8
    );


    try {

        const books =
            await searchBooks(
                "books",
                16
            );


        state.searchResults =
            books;


        renderBooks(
            container,
            books
        );

    } catch {

        renderError(
            container,
            "Unable to open the catalogue."
        );

    }


    input?.addEventListener(
        "keydown",
        async event => {

            if (
                event.key !== "Enter"
            ) {
                return;
            }


            const query =
                input.value.trim();


            if (!query) {
                return;
            }


            renderBookSkeletons(
                container,
                8
            );


            try {

                const books =
                    await searchBooks(
                        query,
                        16
                    );


                state.searchResults =
                    books;


                renderBooks(
                    container,
                    books
                );

            } catch {

                renderError(
                    container,
                    "Search could not be completed."
                );

            }

        }
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   CATEGORIES PAGE
   ============================================================ */

function showCategoriesPage() {

    const categories =
        Object.entries(
            CONFIG.categories
        );


    elements.app.innerHTML = 

        <section class="categories-page">

            <div class="category-page-hero">

                <span class="section-kicker">
                    THE GRAND CATALOGUE
                </span>

                <h1>
                    Explore by subject
                </h1>

                <p>
                    Every subject opens another room.
                </p>

            </div>


            <section class="library-section">

                <div class="category-grid">

                    ${categories
                        .map(
                            ([key, category]) => 

                            <a
                                href="#/${key}"
                                class="
                                    category-card
                                    category-${key}
                                "
                            >

                                <div class="category-light"></div>

                                <div class="category-content">

                                    <span class="category-number">
                                        ${String(
                                            categories.indexOf(
                                                [
                                                    key,
                                                    category
                                                ]
                                            ) + 1
                                        ).padStart(2, "0")}
                                    </span>

                                    <div>

                                        <span class="category-label">
                                            COLLECTION
                                        </span>

                                        <h3>
                                            ${escapeHTML(
                                                category.title
                                            )}
                                        </h3>

                                        <p>
                                            ${escapeHTML(
                                                category.description
                                            )}
                                        </p>

                                    </div>

                                    <span class="category-arrow">
                                        ↗
                                    </span>

                                </div>

                            </a>

                        )
                        .join("")}

                </div>

            </section>

        </section>

    ;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   MY SHELF
   ============================================================ */

function showShelfPage() {

    const books =
        [
            ...state.featuredBooks,
            ...state.popularBooks,
            ...state.searchResults
        ]
            .map(normalizeBook)
            .filter(
                (book, index, array) =>
                    array.findIndex(
                        item =>
                            item.id === book.id
                    ) === index
            )
            .filter(
                book =>
                    state.favorites.includes(
                        book.id
                    )
            );


    elements.app.innerHTML = 

        <section class="shelf-page">

            <div class="category-page-hero">

                <span class="section-kicker">
                    YOUR PERSONAL COLLECTION
                </span>

                <h1>
                    My Shelf
                </h1>

                <p>
                    Books you've chosen to keep close.
                </p>

            </div>


            <section class="library-section">

                <div class="section-heading">

                    <div>
                        <span class="section-kicker">
                            SAVED BOOKS
                        </span>

                        <h2>
                            Your collection
                        </h2>

                    </div>

                </div>


                <div
                    class="book-grid"
                    id="shelfBooks"
                ></div>

            </section>

        </section>

    ;


    const container =
        $("#shelfBooks");


    if (!books.length) {

        container.innerHTML = 

            <div class="empty-shelf">

                <div class="empty-shelf-icon">
                    ✦
                </div>

                <h3>
                    Your shelf is waiting.
                </h3>

                <p>
                    Save books while exploring the library
                    and they will appear here.
                </p>

                <a
                    href="#/explore"
                    class="primary-button"
                >
                    Explore Books
                    <span class="button-arrow">→</span>
                </a>

            </div>

        ;

        return;
    }


    renderBooks(
        container,
        books
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   BOOK DETAILS
   ============================================================ */

function showBookDetails(book) {

    elements.app.innerHTML = 

        <section class="book-details-page">

            <div class="book-details">

                <div class="book-details-cover">

                    <img
                        src="${escapeHTML(book.cover)}"
                        alt="${escapeHTML(book.title)} cover"
                    >

                </div>


                <div class="book-details-information">

                    <span class="section-kicker">
                        BOOK FROM THE CATALOGUE
                    </span>

                    <h1>
                        ${escapeHTML(book.title)}
                    </h1>

                    <h2>
                        ${escapeHTML(book.author)}
                    </h2>

                    <div class="book-meta">

                        <span>
                            ${escapeHTML(
                                String(book.year)
                            )}
                        </span>

                        ${
                            book.publisher
                                ? 
                                    <span>
                                        ${escapeHTML(
                                            book.publisher
                                        )}
                                    </span>
                                  
                                : ""
                        }

                    </div>


                    <p class="book-details-description">
                        This edition is available in the
                        library catalogue. Explore its
                        bibliographic information and discover
                        more works by this author.
                    </p>


                    <div class="book-detail-actions">

                        <button
                            class="primary-button"
                            id="detailSaveButton"
                            type="button"
                        >
                            ${
                                state.favorites.includes(
                                    book.id
                                )
                                    ? "♥ Saved to My Shelf"
                                    : "♡ Add to My Shelf"
                            }
                        </button>

                        <button
                            class="secondary-button"
                            id="backToLibrary"
                            type="button"
                        >
                            ← Back to Library
                        </button>

                    </div>


                    <div class="book-detail-information">

                        <div>

                            <span>
                                AUTHOR
                            </span>

                            <strong>
                                ${escapeHTML(book.author)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                FIRST PUBLISHED
                            </span>

                            <strong>
                                ${escapeHTML(
                                    String(book.year)
                                )}
                            </strong>

                        </div>


                        ${
                            book.isbn
                                ? 
                                    <div>

                                        <span>
                                            ISBN
                                        </span>

                                        <strong>
                                            ${escapeHTML(
                                                String(book.isbn)
                                            )}
                                        </strong>

                                    </div>
                                  
                                : ""
                        }

                    </div>

                </div>

            </div>

        </section>

    ;


    $("#detailSaveButton")
        ?.addEventListener(
            "click",
            () => {

                toggleFavorite(
                    book.id
                );


                $("#detailSaveButton").textContent =
                    state.favorites.includes(
                        book.id
                    )
                        ? "♥ Saved to My Shelf"
                        : "♡ Add to My Shelf";

            }
        );


    $("#backToLibrary")
        ?.addEventListener(
            "click",
            () => {

                window.location.hash =
                    "/explore";

            }
        );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   SIMPLE PAGE
   ============================================================ */

function showSimplePage(
    title,
    description
) {

    elements.app.innerHTML = 

        <section class="simple-page">

            <div class="category-page-hero">

                <span class="section-kicker">
                    THE GRAND LIBRARY
                </span>

                <h1>
                    ${escapeHTML(title)}
                </h1>

                <p>
                    ${escapeHTML(description)}
                </p>

            </div>

            <section class="library-quote">

                <div class="quote-decoration">
                    ✦
                </div>

                <blockquote>
                    Every book is an invitation
                    to see the world differently.
                </blockquote>

            </section>

        </section>

    ;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   NOT FOUND
   ============================================================ */

function showNotFound() {

    elements.app.innerHTML = 

        <section class="simple-page">

            <div class="category-page-hero">

                <span class="section-kicker">
                    404 · QUIET AISLE
                </span>

                <h1>
                    This room doesn't exist.
                </h1>

                <p>
                    Perhaps the book you're looking for
                    is hiding somewhere else in the library.
                </p>

                <a
                    href="#/"
                    class="primary-button"
                >
                    Return Home
                    <span class="button-arrow">→</span>
                </a>

            </div>

        </section>

    ;

}


/* ============================================================
   SKELETON LOADING
   ============================================================ */

function renderBookSkeletons(
    container,
    count
) {

    if (!container) {
        return;
    }


    container.innerHTML =
        Array.from(
            {
                length: count
            },
            () => 

                <article class="book-card skeleton-card">

                    <div class="book-cover skeleton"></div>

                    <div class="book-information">

                        <div class="skeleton skeleton-line"></div>

                        <div class="skeleton skeleton-line short"></div>

                    </div>

                </article>

            
        ).join("");

}


/* ============================================================
   ERROR
   ============================================================ */

function renderError(
    container,
    message
) {

    if (!container) {
        return;
    }


    container.innerHTML = 

        <div class="empty-state">

            <div class="empty-icon">
                !
            </div>

            <h3>
                Something interrupted the catalogue.
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    ;

}


/* ============================================================
   TOAST
   ============================================================ */

let toastTimer = null;


function showToast(message) {

    if (!elements.toast) {
        return;
    }


    elements.toastMessage.textContent =
        message;


    elements.toast.classList.add(
        "visible"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    "visible"
                );

            },
            2600
        );

}


/* ============================================================
   HTML ESCAPING
   ============================================================ */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ============================================================
   IMAGE ERROR PROTECTION
   ============================================================ */

document.addEventListener(
    "error",
    event => {

        const image =
            event.target;


        if (
            image &&
            image.tagName === "IMG" &&
            image.dataset.fallback !== "true"
        ) {

            image.dataset.fallback =
                "true";

            image.src =
                createFallbackCover(
                    image.alt
                        .replace(
                            " cover",
                            ""
                        )
                );

        }

    },
    true
);


/* ============================================================
   GLOBAL POINTER LIGHT
   ============================================================ */

document.addEventListener(
    "pointermove",
    event => {

        document.documentElement.style.setProperty(
            "--pointer-x",
            ${event.clientX}px`
        );


        document.documentElement.style.setProperty(
            "--pointer-y",
            ${event.clientY}px`
        );

    }
);


/* ============================================================
   CONSOLE MESSAGE
   ============================================================ */

console.log(
    "%c✦ The Grand Library",
    "font-size:20px;font-weight:bold;color:#d7b56d;"
);

console.log(
    "%cThe catalogue is open.",
    "font-size:12px;color:#aaa;"
);
