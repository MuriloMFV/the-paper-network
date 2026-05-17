# The Paper Network · The Insights

Blog editorial pessoal desenvolvido com HTML, CSS e JavaScript puro — sem frameworks, sem dependências de build. Estilo inspirado em revistas como Aeon e The Believer, com uma seção hero em colagem analógica e sistema de posts em Markdown.

---

## Estrutura do projeto

```
/
├── index.html              # página inicial
├── post.html               # template de post (reutilizado para todos)
├── style.css               # estilos globais + temas de post
├── script.js               # lógica de carregamento e animações
│
├── posts/
│   ├── social-network.md   # ensaio: The Social Network
│   ├── boyhood.md
│   ├── pirataria.md
│   ├── coisas-antigas.md
│   └── jogos-tycoon.md
│
└── assets/
    ├── images/             # imagens dos posts e cards
    ├── collage/            # PNGs com fundo transparente para o hero
    └── keys/               # imagens das teclas do footer
```

---

## Como rodar localmente

O projeto usa `fetch()` para carregar os arquivos `.md`, então precisa de um servidor local — não funciona abrindo o `index.html` diretamente no navegador (`file://`).

**Python (recomendado):**
```bash
python -m http.server 8080
```

**Node.js:**
```bash
npx serve .
```

Depois acesse `http://localhost:8080` no navegador.

---

## Como criar um novo post

**1. Crie o arquivo** em `posts/meu-post.md` com o frontmatter:

```markdown
---
title: Título do ensaio
date: 2024-05-10
description: Uma frase que resume o post — aparece como subtítulo.
image: assets/images/minha-imagem.jpg
tags: Cinema, Tecnologia
theme: stark
---

Conteúdo do post em Markdown...
```

**2. Adicione o ID** na lista `POST_IDS` dentro de `script.js`:

```js
const POST_IDS = [
  "social-network",
  "boyhood",
  "meu-post",   // ← adicione aqui
];
```

**3. Adicione o card** manualmente no `index.html` dentro da `.grid`, ou deixe o sistema carregar automaticamente se usar `#posts-container`.

---

## Temas de post

Cada post pode declarar um `theme` no frontmatter. O JavaScript aplica o tema como `data-theme` no `<body>`, e o CSS reage com variáveis customizadas de cor.

| Theme | Visual | Indicado para |
|---|---|---|
| `default` | Papel bege, acento terracota | uso geral |
| `dark` | Fundo quase preto, acento cobre | tecnologia, thriller, noite |
| `sepia` | Papel envelhecido, marrom profundo | nostalgia, retro, anos 90 |
| `stark` | Branco puro, vermelho, tipografia grande | cinema, crítica, ensaio agressivo |
| `mind` | Cinza-verde suave, acento floresta | psicologia, comportamento |

Para sobrescrever a cor de acento independente do tema:

```markdown
---
theme: dark
accent: #1a6b9a
---
```

---

## Sistema de colagem (hero)

A seção hero da página inicial usa imagens PNG com fundo transparente posicionadas absolutamente. Cada objeto é um `.obj` com classe `left` ou `right` que define a direção de entrada da animação.

```html
<div class="obj left" style="left:5vw; top:30vh; width:12vw; --r:-6deg; animation-delay:0.7s;">
  <img src="assets/collage/seu-objeto.png" alt="descrição">
</div>
```

| Atributo | Função |
|---|---|
| `left` / `right` | posição horizontal (em `vw`) |
| `top` | posição vertical (em `vh`) |
| `width` | tamanho do objeto (em `vw`) |
| `--r` | ângulo de rotação |
| `animation-delay` | atraso de entrada |
| `opacity` | transparência (opcional) |
| `z-index` | camada — padrão é `5` |

O centro da tela (entre `30vw` e `70vw`) fica reservado para o título.

---

## Footer

O footer usa imagens reais de teclas de teclado para soletrar **THE PAPER NETWORK**. As imagens ficam em `assets/keys/nomedaletra.png` — ex: `assets/keys/t.png`, `assets/keys/h.png`.

Letras repetidas (T, E, P, R) apontam para o mesmo arquivo.

Para ajustar o tamanho das teclas, edite no `style.css`:

```css
.kb-key img {
  width: 72px;   /* largura da imagem da tecla */
  height: 72px;  /* altura da imagem da tecla */
}
```

---

## Animações

Todas as animações respeitam `prefers-reduced-motion` — em sistemas com essa preferência ativada, as animações são desabilitadas automaticamente.

| Animação | Onde |
|---|---|
| Objetos da colagem entram voados | hero — ao carregar |
| Título revela via clip horizontal | hero — ao carregar |
| Sticker bate com bounce | hero — ao carregar |
| Cards sobem ao entrar na viewport | index — scroll |
| Cortina desliza revelando imagem | featured card — scroll |
| Linhas do masthead crescem | masthead — scroll |
| Efeito magnético no hover | objetos da colagem |
| Tecla afunda no hover | footer |
| Barra de progresso de leitura | post — scroll |
| Título do post aparece no header | post — scroll |

---

## Dependências externas

O projeto não tem dependências de build. As únicas bibliotecas externas são carregadas via CDN diretamente no HTML:

- **[marked.js](https://marked.js.org/)** — converte Markdown em HTML no `post.html`
- **Google Fonts** — Cormorant Garamond + DM Sans

---

## Frontmatter completo de referência

```markdown
---
title: Título do ensaio
date: 2024-04-24
description: Subtítulo que aparece abaixo do título e nos cards.
image: assets/images/nome-da-imagem.jpg
tags: Tag1, Tag2
theme: dark
accent: #1a6b9a
---
```

Todos os campos são opcionais exceto `title`. Se `image` estiver vazio, a imagem não é exibida. Se `theme` não for declarado, usa o tema `default`.
