export default class Token {
  private static map = new Map<any, Token>()
  static Create(value: any) {
    if (this.map.has(value)) {
      return this.map.get(value)!
    } else {
      const token = new this(value)
      this.map.set(value, token)
      return token
    }
  }
  private constructor(public value: any) { }
}