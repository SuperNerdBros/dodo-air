<script lang="ts">
  let {
    category,
    dateText = '03/20/20',
    dateColor = null,
    id = `curve-${Math.random().toString(36).substr(2, 9)}`
  } = $props<{
    category: string;
    dateText?: string;
    dateColor?: string | null;
    id?: string;
  }>();

  const categoryFills: Record<string, string> = {
    event: '#ffffee',
    fish: '#3c9bbb',
    insect: '#ffffee',
    communication: '#ffffee',
    diy: '#ffffee',
    hha: '#ffffee',
    plant: '#ffffee',
    smartphone: '#ffffee',
    money: '#ffffee',
    negative: '#ffffee',
    landmaking: '#ffffee',
    mydesign: '#ffffee',
  };

  let fillColor = $derived(dateColor || categoryFills[category] || '#ffffee');

  let pathData = $derived.by(() => {
    switch (category) {
      case 'event': return 'M36.8,71.7c0-19.5,15.8-35.4,35.4-35.4s35.4,15.8,35.4,35.4';
      case 'fish': return 'M26,117.4h92.1';
      case 'insect': return 'M26,114.4h92.1';
      case 'communication': return 'M36.8,81.7c0-19.5,15.8-35.4,35.4-35.4s35.4,15.8,35.4,35.4';
      case 'diy': return 'M26,120.4h92.1';
      case 'hha': return 'M26,118.4h92.1';
      case 'plant': return 'M36.8,74.7c0-19.5,15.8-35.4,35.4-35.4s35.4,15.8,35.4,35.4';
      case 'smartphone': return 'M26,122.4h92.1';
      case 'money': return 'M36.8,71.7c0-19.5,15.8-35.4,35.4-35.4s35.4,15.8,35.4,35.4';
      case 'negative': return 'M36.8,71.7c0-19.5,15.8-35.4,35.4-35.4s35.4,15.8,35.4,35.4';
      case 'landmaking': return 'M26,123.4h92.1';
      case 'mydesign': return 'M24,118.4h92.1';
      default: return 'M26,120.4h92.1';
    }
  });
</script>

<svg
  class="stamp__date"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 144 144"
  xml:space="preserve"
>
  <rect width="144" height="144" fill="none" />
  <path {id} d={pathData} fill="none" />
  <text fill={fillColor} font-weight="700" font-size="22">
    <textPath href="#{id}" startOffset="50%" text-anchor="middle">
      {dateText}
    </textPath>
  </text>
</svg>

<style>
  .stamp__date {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
