import { A, cache, createAsync, useLocation } from "@solidjs/router";
import { type Doc } from "../../scripts/generatemd";
import { log } from "console";
import { getData } from "../../scripts/LoadData";
import { For, Show, createEffect, createSignal } from "solid-js";

const getDocs = cache(async () => {
  "use server";
  return getData();
}, "docs")

export const route = {
  load: () => getDocs()
}

export default function Home() {
  const docs = createAsync(() => getDocs())
  const [target, setTarget] = createSignal("/")

  const active = (path: string) =>
    path == target() ? "text-sky-400" : "";

  const current = () => {
    const targetDoc = docs()?.find((d) => d.Name == target())
    return targetDoc ? targetDoc : undefined!
  }

  return (
    <>
      <aside class="fixed top-0 left-0 w-[300px] text-gray-300 bg-ox-blue h-screen py-5 px-0">
        <ul>
          <For each={docs()}>
            {(doc) =>
              <>
                <button class={`p-4 text-start text-lg hover:text-sky-400 hover:bg-slate-800 w-full ${active(doc.Name)}`}
                  onClick={() => setTarget(doc.Name)}>{doc.Name}</button>
              </>
            }
          </For>
        </ul>
      </aside>
      <main class="text-left mx-auto text-gray-300 p-4 bg-ox-blue h-screen overflow-auto ml-[300px]">
        <Show when={current() === undefined}>
          loading....
        </Show>
        <Show when={current() !== undefined}>
          <section id="documentation" class="space-y-8">
            <h1 class="text-3xl font-bold mb-4">{current().Name}</h1>

            <section id="description" class="mb-4">
              <h2 class="text-xl font-semibold mb-2">Description</h2>
              <p class="text-lg">{current().Desc}</p>
            </section>

            <section id="params" class="mb-4">
              <h2 class="text-xl font-semibold mb-2">Parameters</h2>
              <pre class="bg-gray-800 p-4 rounded-lg mb-4">
                <code class="language-sql">{current().Params.join("\n")}</code>
              </pre>
            </section>

            <section id="returns" class="mb-4">
              <h2 class="text-xl font-semibold mb-2">Returns</h2>
              <ul class="list-disc list-inside">
                <For each={current().Returns}>
                  {(ret) => <li class="text-lg">{ret}</li>}
                </For>
              </ul>
            </section>

            <section id="body" class="mb-4">
              <h2 class="text-xl font-semibold mb-2">Try It</h2>
              <pre class="bg-gray-800 p-4 rounded-lg">
                <code class="language-sql">{current().Body}</code>
              </pre>
            </section>

            <section id="refs" class="mb-4">
              <h2 class="text-xl font-semibold mb-2">References</h2>
              <ul class="list-disc list-inside">
                <For each={current().Refs}>
                  {(ref) => <li class="text-lg">{ref}</li>}
                </For>
              </ul>
            </section>
          </section>
          <div class="mt-4">
            <button class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
              Run {'>'}
            </button>
            <button class="px-4 py-2 ml-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700">
              Reset
            </button>
          </div>
        </Show>
      </main>
    </>
  );
}
