// Developed by Mateo Garcia Carreno

export class TypingTestUtil {
  private static readonly CHARACTERS_PER_WORD = 5;

  private static readonly WORDS = `
    about after again also always another around back because before
    between both call came change come could day different does
    down each early end even every face fact feel few
    find first follow found give good great group hand have
    head help here high home house idea important keep kind
    know large last late learn leave life line little long
    look make many might more most move much must name
    need never next night number often only open order other
    over own part people place plan point problem program public
    question read right room same school seem should show small
    some sprint stand start state still such system take task
    team tell than that there these thing think those through
    time turn under until very want water week well when
    where which while without word work world would write year
  `
    .trim()
    .split(/\s+/);

  static generateText(wordCount: number): string {
    return Array.from(
      { length: wordCount },
      () => TypingTestUtil.WORDS[Math.floor(Math.random() * TypingTestUtil.WORDS.length)],
    ).join(' ');
  }

  static countCorrect(text: string, typed: string): number {
    return [...typed].filter((character, index) => character === text[index]).length;
  }

  static calculateWpm(correctCharacters: number, seconds: number): number {
    if (seconds <= 0) {
      return 0;
    }

    return Math.round(correctCharacters / TypingTestUtil.CHARACTERS_PER_WORD / (seconds / 60));
  }

  static calculateAccuracy(correctKeystrokes: number, keystrokes: number): number {
    if (keystrokes === 0) {
      return 0;
    }

    return Math.round((correctKeystrokes / keystrokes) * 100);
  }
}
