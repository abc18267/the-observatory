<script lang="ts">
  import { addDiscovery } from '../../lib/discovery/store';

  let { word, gameId }: { word: string; gameId: string } = $props();

  let hasClicked = $state(false);

  function handleClick() {
    if (!hasClicked) {
      hasClicked = true;
      addDiscovery(`word:${gameId}`, 'word', `Found the word: ${word}`);
    }

    window.dispatchEvent(
      new CustomEvent('observatory:word-trigger', {
        detail: { gameId },
      })
    );
  }
</script>

<span
  class="word-trigger"
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  {word}
</span>
