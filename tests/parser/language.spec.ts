import { language } from "../../src/parser/language"

describe("language", () => {
  describe("Symbol", () => {
    const { Symbol } = language

    it("should parse a Symbol correctly", () => {
      expect(Symbol.tryParse("a").value).toBe("a")
      expect(Symbol.tryParse("b").value).toBe("b")
      expect(Symbol.tryParse("b1").value).toBe("b1")
      expect(Symbol.tryParse("testing?").value).toBe("testing?")
      expect(Symbol.tryParse("_testin$?").value).toBe("_testin$?")
      expect(Symbol.tryParse("$").value).toBe("$")
      expect(Symbol.tryParse("$?").value).toBe("$?")
      expect(Symbol.tryParse("bang!").value).toBe("bang!")
    })
  })

  describe("String", () => {
    const { String } = language

    it("Should parse a String correctly", () => {
      expect(String.tryParse('""').value).toBe("")
      expect(String.tryParse('"a"').value).toBe("a")
      expect(String.tryParse('" a b\\n c"').value).toBe(" a b\n c")
      expect(String.tryParse('"\\n"').value).toBe("\n")
      expect(String.tryParse("\"'ola '\"").value).toBe("'ola '")
    })
  })

  describe("Char", () => {
    const { Char } = language

    it("Should parse a Char correctly", () => {
      expect(Char.tryParse("'a'").value).toBe("a")
      expect(Char.tryParse("'b'").value).toBe("b")
      expect(Char.tryParse("'1'").value).toBe("1")
    })
  })

  describe("Int", () => {
    const { Int } = language

    it("Should parse an Int correctly", () => {
      expect(Int.tryParse("10").value).toBe(10)
      expect(Int.tryParse("0").value).toBe(0)
      expect(Int.tryParse("999").value).toBe(999)
      expect(Int.tryParse("-12").value).toBe(-12)
      expect(Int.tryParse("-23").value).toBe(-23)
    })
  })

  describe("Float", () => {
    const { Float } = language

    it("Should parse a Float correctly", () => {
      expect(Float.tryParse("10.4").value).toBe(10.4)
      expect(Float.tryParse("0.0").value).toBe(0.0)
      expect(Float.tryParse("999.3").value).toBe(999.3)
      expect(Float.tryParse("-12.2").value).toBe(-12.2)
      expect(Float.tryParse("-23.0").value).toBe(-23.0)
    })
  })

  describe("Generic", () => {
    const { Generic } = language

    it("Should parse a Generic correctly", () => {
      expect(Generic.tryParse("'a").name).toBe("a")
      expect(Generic.tryParse("'b").name).toBe("b")
      expect(Generic.tryParse("'abc").name).toBe("abc")
      expect(Generic.tryParse("'z").name).toBe("z")
    })
  })

  describe("Operator1", () => {
    const { Operator1 } = language

    it("should parse an Operator1 correctly", () => {
      expect(Operator1.tryParse("*").value).toBe("*")
      expect(Operator1.tryParse("*+").value).toBe("*+")
      expect(Operator1.tryParse("/").value).toBe("/")
      expect(Operator1.tryParse("%").value).toBe("%")
      expect(Operator1.tryParse("%-").value).toBe("%-")
      expect(Operator1.tryParse("*=*").value).toBe("*=*")
      expect(Operator1.tryParse("**").value).toBe("**")
      expect(Operator1.tryParse("//").value).toBe("//")
    })
  })

  describe("Operator2", () => {
    const { Operator2 } = language

    it("should parse an Operator2 correctly", () => {
      expect(Operator2.tryParse("+").value).toBe("+")
      expect(Operator2.tryParse("++").value).toBe("++")
      expect(Operator2.tryParse("-").value).toBe("-")
      expect(Operator2.tryParse("--").value).toBe("--")
      expect(Operator2.tryParse("+=+").value).toBe("+=+")
      expect(Operator2.tryParse("-?-").value).toBe("-?-")
    })
  })

  describe("Operator3", () => {
    const { Operator3 } = language

    it("should parse an Operator3 correctly", () => {
      expect(Operator3.tryParse(":").value).toBe(":")
      expect(Operator3.tryParse("::").value).toBe("::")
      expect(Operator3.tryParse(":=:").value).toBe(":=:")
      expect(Operator3.tryParse(":?").value).toBe(":?")
    })
  })

  describe("Operator4", () => {
    const { Operator4 } = language

    it("should parse an Operator4 correctly", () => {
      expect(Operator4.tryParse("=").value).toBe("=")
      expect(Operator4.tryParse("=+").value).toBe("=+")
      expect(Operator4.tryParse("!").value).toBe("!")
      expect(Operator4.tryParse("!-").value).toBe("!-")
      expect(Operator4.tryParse("===").value).toBe("===")
      expect(Operator4.tryParse("!!").value).toBe("!!")
    })
  })

  describe("Operator5", () => {
    const { Operator5 } = language

    it("should parse an Operator5 correctly", () => {
      expect(Operator5.tryParse(">").value).toBe(">")
      expect(Operator5.tryParse("<").value).toBe("<")
      expect(Operator5.tryParse(">+").value).toBe(">+")
      expect(Operator5.tryParse(">=>").value).toBe(">=>")
      expect(Operator5.tryParse("<<").value).toBe("<<")
    })
  })

  describe("Operator6", () => {
    const { Operator6 } = language

    it("should parse an Operator6 correctly", () => {
      expect(Operator6.tryParse("&").value).toBe("&")
      expect(Operator6.tryParse("&-").value).toBe("&-")
      expect(Operator6.tryParse("&&").value).toBe("&&")
      expect(Operator6.tryParse("&=&").value).toBe("&=&")
    })
  })

  describe("Operator7", () => {
    const { Operator7 } = language

    it("should parse an Operator7 correctly", () => {
      expect(Operator7.tryParse("^").value).toBe("^")
      expect(Operator7.tryParse("^-").value).toBe("^-")
      expect(Operator7.tryParse("^^").value).toBe("^^")
      expect(Operator7.tryParse("^=^").value).toBe("^=^")
    })
  })

  describe("Operator8", () => {
    const { Operator8 } = language

    it("should parse an Operator8 correctly", () => {
      expect(Operator8.tryParse("|").value).toBe("|")
      expect(Operator8.tryParse("|-").value).toBe("|-")
      expect(Operator8.tryParse("|").value).toBe("|")
      expect(Operator8.tryParse("|=|").value).toBe("|=|")
    })
  })

  describe("SymbolAccess", () => {
    const { SymbolAccess } = language

    it("should parse an SymbolAccess correctly", () => {
      expect(SymbolAccess.tryParse("a").str()).toBe("a")
      expect(SymbolAccess.tryParse("c").str()).toBe("c")
      expect(SymbolAccess.tryParse("a.b.c").str()).toBe("a.b.c")
      expect(SymbolAccess.tryParse("a.b").str()).toBe("a.b")
      expect(SymbolAccess.tryParse("a.b1").str()).toBe("a.b1")
      expect(SymbolAccess.tryParse("testing?._testin$?").str()).toBe(
        "testing?._testin$?"
      )
      expect(SymbolAccess.tryParse("_testin$?").str()).toBe("_testin$?")
      expect(SymbolAccess.tryParse("$._testin$?.bang!.a13").str()).toBe(
        "$._testin$?.bang!.a13"
      )
    })
  })

  //   describe("SymbolOrRecord", () => {
  //     const { SymbolOrRecord } = language

  //     it("should parse an SymbolOrRecord correctly", () => {
  //       expect(SymbolOrRecord.tryParse("a").str()).toBe("a")
  //       expect(SymbolOrRecord.tryParse("c").str()).toBe("c")
  //       expect(SymbolOrRecord.tryParse("a.b.c").str()).toBe("a.b.c")
  //       expect(SymbolOrRecord.tryParse("a.b").str()).toBe("a.b")
  //       expect(SymbolOrRecord.tryParse("a.b1").str()).toBe("a.b1")
  //       expect(SymbolOrRecord.tryParse("testing?._testin$?").str()).toBe(
  //         "testing?._testin$?"
  //       )
  //       expect(SymbolOrRecord.tryParse("_testin$?").str()).toBe("_testin$?")
  //       expect(SymbolOrRecord.tryParse("$._testin$?.bang!.a13").str()).toBe(
  //         "$._testin$?.bang!.a13"
  //       )
  //     })

  //     it("should parse an SymbolOrRecord correctly", () => {
  //       expect(SymbolOrRecord.tryParse('a {name: "a"}').str()).toBe("a")
  //       expect(SymbolOrRecord.tryParse("c").str()).toBe("c")
  //       expect(SymbolOrRecord.tryParse("a.b.c").str()).toBe("a.b.c")
  //       expect(SymbolOrRecord.tryParse("a.b").str()).toBe("a.b")
  //       expect(SymbolOrRecord.tryParse("a.b1").str()).toBe("a.b1")
  //       expect(SymbolOrRecord.tryParse("testing?._testin$?").str()).toBe(
  //         "testing?._testin$?"
  //       )
  //       expect(SymbolOrRecord.tryParse("_testin$?").str()).toBe("_testin$?")
  //       expect(SymbolOrRecord.tryParse("$._testin$?.bang!.a13").str()).toBe(
  //         "$._testin$?.bang!.a13"
  //       )
  //     })
  //   })
})
