import { inject, Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Pipe({
  name: 'manaSymbol',
  standalone: true,
})
export class ManaSymbolPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer)

  transform(value: string | undefined | null): SafeHtml {
    if (!value) return ''

    const manaMap: { [key: string]: string } = {
      '{W}': '<i class="ms ms-w ms-cost"></i>',
      '{U}': '<i class="ms ms-u ms-cost"></i>',
      '{B}': '<i class="ms ms-b ms-cost"></i>',
      '{R}': '<i class="ms ms-r ms-cost"></i>',
      '{G}': '<i class="ms ms-g ms-cost"></i>',
      '{C}': '<i class="ms ms-c ms-cost"></i>',
      '{X}': '<i class="ms ms-x ms-cost"></i>',
      '{0}': '<i class="ms ms-0 ms-cost"></i>',
      '{1}': '<i class="ms ms-1 ms-cost"></i>',
      '{2}': '<i class="ms ms-2 ms-cost"></i>',
      '{3}': '<i class="ms ms-3 ms-cost"></i>',
      '{4}': '<i class="ms ms-4 ms-cost"></i>',
      '{5}': '<i class="ms ms-5 ms-cost"></i>',
      '{6}': '<i class="ms ms-6 ms-cost"></i>',
      '{7}': '<i class="ms ms-7 ms-cost"></i>',
      '{8}': '<i class="ms ms-8 ms-cost"></i>',
      '{9}': '<i class="ms ms-9 ms-cost"></i>',
      '{10}': '<i class="ms ms-10 ms-cost"></i>',
      '{11}': '<i class="ms ms-11 ms-cost"></i>',
      '{12}': '<i class="ms ms-12 ms-cost"></i>',
      '{13}': '<i class="ms ms-13 ms-cost"></i>',
      '{14}': '<i class="ms ms-14 ms-cost"></i>',
      '{15}': '<i class="ms ms-15 ms-cost"></i>',
      '{16}': '<i class="ms ms-16 ms-cost"></i>',
      '{17}': '<i class="ms ms-17 ms-cost"></i>',
      '{18}': '<i class="ms ms-18 ms-cost"></i>',
      '{19}': '<i class="ms ms-19 ms-cost"></i>',
      '{20}': '<i class="ms ms-20 ms-cost"></i>',
      '{W/U}': '<i class="ms ms-wu ms-cost"></i>',
      '{W/B}': '<i class="ms ms-wb ms-cost"></i>',
      '{B/R}': '<i class="ms ms-br ms-cost"></i>',
      '{B/G}': '<i class="ms ms-bg ms-cost"></i>',
      '{U/B}': '<i class="ms ms-ub ms-cost"></i>',
      '{U/R}': '<i class="ms ms-ur ms-cost"></i>',
      '{R/G}': '<i class="ms ms-rg ms-cost"></i>',
      '{R/W}': '<i class="ms ms-rw ms-cost"></i>',
      '{G/W}': '<i class="ms ms-gw ms-cost"></i>',
      '{G/U}': '<i class="ms ms-gu ms-cost"></i>',
      '{2/W}': '<i class="ms ms-2w ms-cost"></i>',
      '{2/U}': '<i class="ms ms-2u ms-cost"></i>',
      '{2/B}': '<i class="ms ms-2b ms-cost"></i>',
      '{2/R}': '<i class="ms ms-2r ms-cost"></i>',
      '{2/G}': '<i class="ms ms-2g ms-cost"></i>',
      '{W/P}': '<i class="ms ms-wp ms-cost"></i>',
      '{U/P}': '<i class="ms ms-up ms-cost"></i>',
      '{B/P}': '<i class="ms ms-bp ms-cost"></i>',
      '{R/P}': '<i class="ms ms-rp ms-cost"></i>',
      '{G/P}': '<i class="ms ms-gp ms-cost"></i>',
      '{HW}': '<i class="ms ms-hw ms-cost"></i>',
      '{HR}': '<i class="ms ms-hr ms-cost"></i>',
      '{S}': '<i class="ms ms-s ms-cost"></i>',
      '{T}': '<i class="ms ms-tap ms-cost"></i>',
      '{Q}': '<i class="ms ms-untap ms-cost"></i>',
      '{E}': '<i class="ms ms-e ms-cost"></i>',
      '{PW}': '<i class="ms ms-loyalty-start ms-loyalty-1"></i>',
      '{CHAOS}': '<i class="ms ms-chaos"></i>',
      '{A}': '<i class="ms ms-acorn"></i>',
      '{TK}': '<i class="ms ms-ticket"></i>',
      '{P}': '<i class="ms ms-p ms-cost"></i>',
    }

    let convertedText = value
    for (const [symbol, html] of Object.entries(manaMap)) {
      convertedText = convertedText.replace(new RegExp(symbol.replace(/[{}]/g, '\\$&'), 'g'), html)
    }

    return this.sanitizer.bypassSecurityTrustHtml(convertedText)
  }
}
