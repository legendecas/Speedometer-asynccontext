import { BenchmarkTestStep } from "./benchmark-runner.mjs";
import { todos } from "./translations.mjs";

const numberOfItemsToAdd = 100;
const defaultLanguage = "en";

function getTodoText(lang, index) {
    const todosSelection = todos[lang] ?? todos[defaultLanguage];
    const currentIndex = index % todosSelection.length;
    return todosSelection[currentIndex];
}

export const Suites = [];

Suites.enable = function (names, tags) {
    if (names?.length) {
        const lowerCaseNames = names.map((each) => each.toLowerCase());
        this.forEach((suite) => {
            if (lowerCaseNames.includes(suite.name.toLowerCase()))
                suite.disabled = false;
            else
                suite.disabled = true;
        });
    } else if (tags?.length) {
        tags.forEach((tag) => {
            if (!Tags.has(tag))
                console.error(`Unknown Suites tag: "${tag}"`);
        });
        const tagsSet = new Set(tags);
        this.forEach((suite) => {
            suite.disabled = !suite.tags.some((tag) => tagsSet.has(tag));
        });
    } else {
        console.warn("Neither names nor tags provided. Enabling all default suites.");
        this.forEach((suite) => {
            suite.disabled = !("default" in suite.tags);
        });
    }
    if (this.some((suite) => !suite.disabled))
        return;
    let message, debugInfo;
    if (names?.length) {
        message = `Suites "${names}" does not match any Suite. No tests to run.`;
        debugInfo = {
            providedNames: names,
            validNames: this.map((each) => each.name),
        };
    } else if (tags?.length) {
        message = `Tags "${tags}" does not match any Suite. No tests to run.`;
        debugInfo = {
            providedTags: tags,
            validTags: Array.from(Tags),
        };
    }
    alert(message);
    console.error(message, debugInfo);
};

Suites.push({
    name: "AsyncContext-microtbench",
    url: "asynccontext/microbench/index.html",
    tags: ["asynccontext"],
    async prepare(page) {
        (await page.waitForElement("#start")).focus();
    },
    tests: [
        new BenchmarkTestStep(`Run`, async (page) => {
            const button = page.querySelector("#start");
            button.click();
            await page.waitForElement("#result");
        }),
    ],
});

Suites.push({
    name: "TodoMVC-JavaScript-ES5",
    url: "todomvc/vanilla-examples/javascript-es5/dist/index.html",
    tags: ["todomvc"],
    async prepare(page) {
        (await page.waitForElement(".new-todo")).focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, async (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(getTodoText("ja", i));
                newTodo.dispatchEvent("change");
                newTodo.enter("keypress");
            }
            await page.waitForElement(".todo-list li[data-id='" + numberOfItemsToAdd + "']");
        }),
        new BenchmarkTestStep("CompletingAllItems", async (page) => {
            const checkboxes = page.querySelectorAll(".toggle");
            for (let i = 0; i < numberOfItemsToAdd; i++)
                checkboxes[i].click();
            await page.waitForElement(".todo-list li[data-id='" + numberOfItemsToAdd + "'].completed");
        }),
        new BenchmarkTestStep("DeletingAllItems", (page) => {
            const deleteButtons = page.querySelectorAll(".destroy");
            for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-Angular",
    url: "todomvc/architecture-examples/angular/dist/index.html",
    tags: ["todomvc"],
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(getTodoText(defaultLanguage, i));
                newTodo.dispatchEvent("input");
                newTodo.enter("keyup");
            }
        }),
        new BenchmarkTestStep("CompletingAllItems", (page) => {
            const checkboxes = page.querySelectorAll(".toggle");
            for (let i = 0; i < numberOfItemsToAdd; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep("DeletingAllItems", (page) => {
            const deleteButtons = page.querySelectorAll(".destroy");
            for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-React",
    url: "todomvc/architecture-examples/react/dist/index.html#/home",
    tags: ["todomvc"],
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(getTodoText(defaultLanguage, i));
                newTodo.dispatchEvent("input");
                newTodo.enter("keydown");
            }
        }),
        new BenchmarkTestStep("CompletingAllItems", (page) => {
            const checkboxes = page.querySelectorAll(".toggle");
            for (let i = 0; i < numberOfItemsToAdd; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep("DeletingAllItems", (page) => {
            const deleteButtons = page.querySelectorAll(".destroy");
            for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                deleteButtons[i].click();
        }),
    ],
});

Object.freeze(Suites);
Suites.forEach((suite) => {
    if (!suite.tags)
        suite.tags = [];
    if (suite.url.startsWith("tentative/"))
        suite.tags.unshift("all", "tentative");
    else if (suite.disabled)
        suite.tags.unshift("all");
    else
        suite.tags.unshift("all", "default");
    Object.freeze(suite.tags);
    Object.freeze(suite.steps);
});

export const Tags = new Set(["all", "default", "tentative", ...Suites.flatMap((suite) => suite.tags)]);
Object.freeze(Tags);

globalThis.Suites = Suites;
globalThis.Tags = Tags;
