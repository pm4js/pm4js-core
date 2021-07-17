class Pm4JS {
	static registerObject(obj, description) {
		if (Pm4JS.registrationEnabled) {
			if (description == null) {
				description = obj.className;
			}
			Pm4JS.objects.push({"object": obj, "creationDate": new Date().getTime(), "description": description});
			for (let callback of Pm4JS.objectsCallbacks) {
				callback();
			}
		}
	}
	
	static registerAlgorithm(className, methodName, inputs, output, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.algorithms.push({"className": className, "methodName": methodName, "inputs": inputs, "output": output, "description": description, "authors": authors});
	}
	
	static registerImporter(className, methodName, extensions, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.importers.push({"className": className, "methodName": methodName, "extensions": extensions, "description": description, "authors": authors});
		for (let callback of Pm4JS.objectsCallbacks) {
			callback();
		}
	}
	
	static registerExporter(className, methodName, exportedObjType, extension, mimeType, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.exporters.push({"className": className, "methodName": methodName, "exportedObjType": exportedObjType, "extension": extension, "mimeType": mimeType, "description": description, "authors": authors});
	}
	
	static registerVisualizer(className, methodName, input, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.visualizers.push({"className": className, "methodName": methodName, "input": input, "description": description, "authors": authors});
	}
	
	static registerCallback(f) {
		Pm4JS.objectsCallbacks.push(f);
	}
}

Pm4JS.registrationEnabled = false;
Pm4JS.objects = [];
Pm4JS.algorithms = [];
Pm4JS.importers = [];
Pm4JS.exporters = [];
Pm4JS.visualizers = [];
Pm4JS.objectsCallbacks = [];

try {
	module.exports = {Pm4JS: Pm4JS};
	global.Pm4JS = Pm4JS;
}
catch (err) {
	// not in node
}

// HumanizeDuration.js - https://git.io/j0HgmQ

/* global define, module */

(function () {
  // This has to be defined separately because of a bug: we want to alias
  // `gr` and `el` for backwards-compatiblity. In a breaking change, we can
  // remove `gr` entirely.
  // See https://github.com/EvanHahn/HumanizeDuration.js/issues/143 for more.
  var greek = {
    y: function (c) {
      return c === 1 ? "χ�όνος" : "χ�όνια";
    },
    mo: function (c) {
      return c === 1 ? "μήνας" : "μήνες";
    },
    w: function (c) {
      return c === 1 ? "εβδομάδα" : "εβδομάδες";
    },
    d: function (c) {
      return c === 1 ? "μέ�α" : "μέ�ες";
    },
    h: function (c) {
      return c === 1 ? "ώ�α" : "ώ�ες";
    },
    m: function (c) {
      return c === 1 ? "λεπτό" : "λεπτά";
    },
    s: function (c) {
      return c === 1 ? "δευτε�όλεπτο" : "δευτε�όλεπτα";
    },
    ms: function (c) {
      return c === 1
        ? "χιλιοστό του δευτε�ολέπτου"
        : "χιλιοστά του δευτε�ολέπτου";
    },
    decimal: ","
  };

  var ARABIC_DIGITS = ["۰", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  var LANGUAGES = {
    af: {
      y: "jaar",
      mo: function (c) {
        return "maand" + (c === 1 ? "" : "e");
      },
      w: function (c) {
        return c === 1 ? "week" : "weke";
      },
      d: function (c) {
        return c === 1 ? "dag" : "dae";
      },
      h: function (c) {
        return c === 1 ? "uur" : "ure";
      },
      m: function (c) {
        return c === 1 ? "minuut" : "minute";
      },
      s: function (c) {
        return "sekonde" + (c === 1 ? "" : "s");
      },
      ms: function (c) {
        return "millisekonde" + (c === 1 ? "" : "s");
      },
      decimal: ","
    },
    ar: {
      y: function (c) {
        return ["سنة", "سنتان", "سنوات"][getArabicForm(c)];
      },
      mo: function (c) {
        return ["شهر", "شهران", "أشهر"][getArabicForm(c)];
      },
      w: function (c) {
        return ["أسبوع", "أسبوعين", "أسابيع"][getArabicForm(c)];
      },
      d: function (c) {
        return ["يوم", "يومين", "أيام"][getArabicForm(c)];
      },
      h: function (c) {
        return ["ساعة", "ساعتين", "ساعات"][getArabicForm(c)];
      },
      m: function (c) {
        return ["دقيقة", "دقيقتان", "دقائق"][getArabicForm(c)];
      },
      s: function (c) {
        return ["ثانية", "ثانيتان", "ثواني"][getArabicForm(c)];
      },
      ms: function (c) {
        return ["جزء من الثانية", "جزآن من الثانية", "أجزاء من الثانية"][
          getArabicForm(c)
        ];
      },
      decimal: ",",
      delimiter: " و ",
      _formatCount: function (count, decimal) {
        var replacements = assign(ARABIC_DIGITS, { ".": decimal });
        var characters = count.toString().split("");
        for (var i = 0; i < characters.length; i++) {
          var character = characters[i];
          if (has(replacements, character)) {
            characters[i] = replacements[character];
          }
        }
        return characters.join("");
      }
    },
    bg: {
      y: function (c) {
        return ["години", "година", "години"][getSlavicForm(c)];
      },
      mo: function (c) {
        return ["ме�еца", "ме�ец", "ме�еца"][getSlavicForm(c)];
      },
      w: function (c) {
        return ["�едмици", "�едмица", "�едмици"][getSlavicForm(c)];
      },
      d: function (c) {
        return ["дни", "ден", "дни"][getSlavicForm(c)];
      },
      h: function (c) {
        return ["ча�а", "ча�", "ча�а"][getSlavicForm(c)];
      },
      m: function (c) {
        return ["минути", "минута", "минути"][getSlavicForm(c)];
      },
      s: function (c) {
        return ["�екунди", "�екунда", "�екунди"][getSlavicForm(c)];
      },
      ms: function (c) {
        return ["мили�екунди", "мили�екунда", "мили�екунди"][getSlavicForm(c)];
      },
      decimal: ","
    },
    bn: {
      y: "বছর",
      mo: "মাস",
      w: "সপ�তাহ",
      d: "দিন",
      h: "ঘন�টা",
      m: "মিনিট",
      s: "সেকেন�ড",
      ms: "মিলিসেকেন�ড"
    },
    ca: {
      y: function (c) {
        return "any" + (c === 1 ? "" : "s");
      },
      mo: function (c) {
        return "mes" + (c === 1 ? "" : "os");
      },
      w: function (c) {
        return "setman" + (c === 1 ? "a" : "es");
      },
      d: function (c) {
        return "di" + (c === 1 ? "a" : "es");
      },
      h: function (c) {
        return "hor" + (c === 1 ? "a" : "es");
      },
      m: function (c) {
        return "minut" + (c === 1 ? "" : "s");
      },
      s: function (c) {
        return "segon" + (c === 1 ? "" : "s");
      },
      ms: function (c) {
        return "milisegon" + (c === 1 ? "" : "s");
      },
      decimal: ","
    },
    cs: {
      y: function (c) {
        return ["rok", "roku", "roky", "let"][getCzechOrSlovakForm(c)];
      },
      mo: function (c) {
        return ["měsíc", "měsíce", "měsíce", "měsíců"][getCzechOrSlovakForm(c)];
      },
      w: function (c) {
        return ["týden", "týdne", "týdny", "týdnů"][getCzechOrSlovakForm(c)];
      },
      d: function (c) {
        return ["den", "dne", "dny", "dní"][getCzechOrSlovakForm(c)];
      },
      h: function (c) {
        return ["hodina", "hodiny", "hodiny", "hodin"][getCzechOrSlovakForm(c)];
      },
      m: function (c) {
        return ["minuta", "minuty", "minuty", "minut"][getCzechOrSlovakForm(c)];
      },
      s: function (c) {
        return ["sekunda", "sekundy", "sekundy", "sekund"][
          getCzechOrSlovakForm(c)
        ];
      },
      ms: function (c) {
        return ["milisekunda", "milisekundy", "milisekundy", "milisekund"][
          getCzechOrSlovakForm(c)
        ];
      },
      decimal: ","
    },
    cy: {
      y: "flwyddyn",
      mo: "mis",
      w: "wythnos",
      d: "diwrnod",
      h: "awr",
      m: "munud",
      s: "eiliad",
      ms: "milieiliad"
    },
    da: {
      y: "år",
      mo: function (c) {
        return "måned" + (c === 1 ? "" : "er");
      },
      w: function (c) {
        return "uge" + (c === 1 ? "" : "r");
      },
      d: function (c) {
        return "dag" + (c === 1 ? "" : "e");
      },
      h: function (c) {
        return "time" + (c === 1 ? "" : "r");
      },
      m: function (c) {
        return "minut" + (c === 1 ? "" : "ter");
      },
      s: function (c) {
        return "sekund" + (c === 1 ? "" : "er");
      },
      ms: function (c) {
        return "millisekund" + (c === 1 ? "" : "er");
      },
      decimal: ","
    },
    de: {
      y: function (c) {
        return "Jahr" + (c === 1 ? "" : "e");
      },
      mo: function (c) {
        return "Monat" + (c === 1 ? "" : "e");
      },
      w: function (c) {
        return "Woche" + (c === 1 ? "" : "n");
      },
      d: function (c) {
        return "Tag" + (c === 1 ? "" : "e");
      },
      h: function (c) {
        return "Stunde" + (c === 1 ? "" : "n");
      },
      m: function (c) {
        return "Minute" + (c === 1 ? "" : "n");
      },
      s: function (c) {
        return "Sekunde" + (c === 1 ? "" : "n");
      },
      ms: function (c) {
        return "Millisekunde" + (c === 1 ? "" : "n");
      },
      decimal: ","
    },
    el: greek,
    en: {
      y: function (c) {
        return "year" + (c === 1 ? "" : "s");
      },
      mo: function (c) {
        return "month" + (c === 1 ? "" : "s");
      },
      w: function (c) {
        return "week" + (c === 1 ? "" : "s");
      },
      d: function (c) {
        return "day" + (c === 1 ? "" : "s");
      },
      h: function (c) {
        return "hour" + (c === 1 ? "" : "s");
      },
      m: function (c) {
        return "minute" + (c === 1 ? "" : "s");
      },
      s: function (c) {
        return "second" + (c === 1 ? "" : "s");
      },
      ms: function (c) {
        return "millisecond" + (c === 1 ? "" : "s");
      },
      decimal: "."
    },
    eo: {
      y: function (c) {
        return "jaro" + (c === 1 ? "" : "j");
      },
      mo: function (c) {
        return "monato" + (c === 1 ? "" : "j");
      },
      w: function (c) {
        return "semajno" + (c === 1 ? "" : "j");
      },
      d: function (c) {
        return "tago" + (c === 1 ? "" : "j");
      },
      h: function (c) {
        return "horo" + (c === 1 ? "" : "j");
      },
      m: function (c) {
        return "minuto" + (c === 1 ? "" : "j");
      },
      s: function (c) {
        return "sekundo" + (c === 1 ? "" : "j");
      },
      ms: function (c) {
        return "milisekundo" + (c === 1 ? "" : "j");
      },
      decimal: ","
    },
    es: {
      y: function (c) {
        return "año" + (c === 1 ? "" : "s");
      },
      mo: function (c) {
        return "mes" + (c === 1 ? "" : "es");
      },
      w: function (c) {
        return "semana" + (c === 1 ? "" : "s");
      },
      d: function (c) {
        return "día" + (c === 1 ? "" : "s");
      },
      h: function (c) {
        return "hora" + (c === 1 ? "" : "s");
      },
      m: function (c) {
        return "minuto" + (c === 1 ? "" : "s");
      },
      s: function (c) {
        return "segundo" + (c === 1 ? "" : "s");
      },
      ms: function (c) {
        return "milisegundo" + (c === 1 ? "" : "s");
      },
      decimal: ","
    },
    et: {
      y: function (c) {
        return "aasta" + (c === 1 ? "" : "t");
      },
      mo: function (c) {
        return "kuu" + (c === 1 ? "" : "d");
      },
      w: function (c) {
        return "nädal" + (c === 1 ? "" : "at");
      },
      d: function (c) {
        return "päev" + (c === 1 ? "" : "a");
      },
      h: function (c) {
        return "tund" + (c === 1 ? "" : "i");
      },
      m: function (c) {
        return "minut" + (c === 1 ? "" : "it");
      },
      s: function (c) {
        return "sekund" + (c === 1 ? "" : "it");
      },
      ms: function (c) {
        return "millisekund" + (c === 1 ? "" : "it");
      },
      decimal: ","
    },
    eu: {
      y: "urte",
      mo: "hilabete",
      w: "aste",
      d: "egun",
      h: "ordu",
      m: "minutu",
      s: "segundo",
      ms: "milisegundo",
      decimal: ","
    },
    fa: {
      y: "سال",
      mo: "ماه",
      w: "ه�ته",
      d: "روز",
      h: "ساعت",
      m: "دقیقه",
      s: "ثانیه",
      ms: "میلی ثانیه",
      decimal: "."
    },
    fi: {
      y: function (c) {
        return c === 1 ? "vuosi" : "vuotta";
      },
      mo: function (c) {
        return c === 1 ? "kuukausi" : "kuukautta";
      },
      w: function (c) {
        return "viikko" + (c === 1 ? "" : "a");
      },
      d: function (c) {
        return "päivä" + (c === 1 ? "" : "ä");
      },
      h: function (c) {
        return "tunti" + (c === 1 ? "" : "a");
      },
      m: function (c) {
        return "minuutti" + (c === 1 ? "" : "a");
      },
      s: function (c) {
        return "sekunti" + (c === 1 ? "" : "a");
      },
      ms: function (c) {
        return "millisekunti" + (c === 1 ? "" : "a");
      },
      decimal: ","
    },
    fo: {
      y: "ár",
      mo: function (c) {
        return c === 1 ? "mánaður" : "mánaðir";
      },
      w: function (c) {
        return c === 1 ? "vika" : "vikur";
      },
      d: function (c) {
        return c === 1 ? "dagur" : "dagar";
      },
      h: function (c) {
        return c === 1 ? "tími" : "tímar";
      },
      m: function (c) {
        return c === 1 ? "minuttur" : "minuttir";
      },
      s: "sekund",
      ms: "millisekund",
      decimal: ","
    },
    fr: {
      y: function (c) {
        return "an" + (c >= 2 ? "s" : "");
      },
      mo: "mois",
      w: function (c) {
        return "semaine" + (c >= 2 ? "s" : "");
      },
      d: function (c) {
        return "jour" + (c >= 2 ? "s" : "");
      },
      h: function (c) {
        return "heure" + (c >= 2 ? "s" : "");
      },
      m: function (c) {
        return "minute" + (c >= 2 ? "s" : "");
      },
      s: function (c) {
        return "seconde" + (c >= 2 ? "s" : "");
      },
      ms: function (c) {
        return "milliseconde" + (c >= 2 ? "s" : "");
      },
      decimal: ","
    },
    gr: greek,
    he: {
      y: function (c) {
        return c === 1 ? "שנה" : "שני�";
      },
      mo: function (c) {
        return c === 1 ? "חודש" : "חודשי�";
      },
      w: function (c) {
        return c === 1 ? "שבוע" : "שבועות";
      },
      d: function (c) {
        return c === 1 ? "יו�" : "ימי�";
      },
      h: function (c) {
        return c === 1 ? "שעה" : "שעות";
      },
      m: function (c) {
        return c === 1 ? "דקה" : "דקות";
      },
      s: function (c) {
        return c === 1 ? "שניה" : "שניות";
      },
      ms: function (c) {
        return c === 1 ? "מילישנייה" : "מילישניות";
      },
      decimal: "."
    },
    hr: {
      y: function (c) {
        if (c % 10 === 2 || c % 10 === 3 || c % 10 === 4) {
          return "godine";
        }
        return "godina";
      },
      mo: function (c) {
        if (c === 1) {
          return "mjesec";
        } else if (c === 2 || c === 3 || c === 4) {
          return "mjeseca";
        }
        return "mjeseci";
      },
      w: function (c) {
        if (c % 10 === 1 && c !== 11) {
          return "tjedan";
        }
        return "tjedna";
      },
      d: function (c) {
        return c === 1 ? "dan" : "dana";
      },
      h: function (c) {
        if (c === 1) {
          return "sat";
        } else if (c === 2 || c === 3 || c === 4) {
          return "sata";
        }
        return "sati";
      },
      m: function (c) {
        var mod10 = c % 10;
        if ((mod10 === 2 || mod10 === 3 || mod10 === 4) && (c < 10 || c > 14)) {
          return "minute";
        }
        return "minuta";
      },
      s: function (c) {
        var mod10 = c % 10;
        if (mod10 === 5 || (Math.floor(c) === c && c >= 10 && c <= 19)) {
          return "sekundi";
        } else if (mod10 === 1) {
          return "sekunda";
        } else if (mod10 === 2 || mod10 === 3 || mod10 === 4) {
          return "sekunde";
        }
        return "sekundi";
      },
      ms: function (c) {
        if (c === 1) {
          return "milisekunda";
        } else if (c % 10 === 2 || c % 10 === 3 || c % 10 === 4) {
          return "milisekunde";
        }
        return "milisekundi";
      },
      decimal: ","
    },
    hi: {
      y: "साल",
      mo: function (c) {
        return c === 1 ? "महीना" : "महीने";
      },
      w: function (c) {
        return c === 1 ? "हफ़�ता" : "हफ�ते";
      },
      d: "दिन",
      h: function (c) {
        return c === 1 ? "घंटा" : "घंटे";
      },
      m: "मिनट",
      s: "सेकंड",
      ms: "मिलीसेकंड",
      decimal: "."
    },
    hu: {
      y: "év",
      mo: "hónap",
      w: "hét",
      d: "nap",
      h: "óra",
      m: "perc",
      s: "másodperc",
      ms: "ezredmásodperc",
      decimal: ","
    },
    id: {
      y: "tahun",
      mo: "bulan",
      w: "minggu",
      d: "hari",
      h: "jam",
      m: "menit",
      s: "detik",
      ms: "milidetik",
      decimal: "."
    },
    is: {
      y: "ár",
      mo: function (c) {
        return "mánuð" + (c === 1 ? "ur" : "ir");
      },
      w: function (c) {
        return "vik" + (c === 1 ? "a" : "ur");
      },
      d: function (c) {
        return "dag" + (c === 1 ? "ur" : "ar");
      },
      h: function (c) {
        return "klukkutím" + (c === 1 ? "i" : "ar");
      },
      m: function (c) {
        return "mínút" + (c === 1 ? "a" : "ur");
      },
      s: function (c) {
        return "sekúnd" + (c === 1 ? "a" : "ur");
      },
      ms: function (c) {
        return "millisekúnd" + (c === 1 ? "a" : "ur");
      },
      decimal: "."
    },
    it: {
      y: function (c) {
        return "ann" + (c === 1 ? "o" : "i");
      },
      mo: function (c) {
        return "mes" + (c === 1 ? "e" : "i");
      },
      w: function (c) {
        return "settiman" + (c === 1 ? "a" : "e");
      },
      d: function (c) {
        return "giorn" + (c === 1 ? "o" : "i");
      },
      h: function (c) {
        return "or" + (c === 1 ? "a" : "e");
      },
      m: function (c) {
        return "minut" + (c === 1 ? "o" : "i");
      },
      s: function (c) {
        return "second" + (c === 1 ? "o" : "i");
      },
      ms: function (c) {
        return "millisecond" + (c === 1 ? "o" : "i");
      },
      decimal: ","
    },
    ja: {
      y: "年",
      mo: "月",
      w: "週",
      d: "日",
      h: "時間",
      m: "分",
      s: "秒",
      ms: "ミリ秒",
      decimal: "."
    },
    km: {
      y: "ឆ្នាំ",
      mo: "�ែ",
      w: "សប្�ាហ�",
      d: "�្ងៃ",
      h: "ម៉ោង",
      m: "នាទី",
      s: "វិនាទី",
      ms: "មិល្លីវិនាទី"
    },
    kn: {
      y: function (c) {
        return c === 1 ? "ವರ�ಷ" : "ವರ�ಷಗಳ�";
      },
      mo: function (c) {
        return c === 1 ? "ತಿಂಗಳ�" : "ತಿಂಗಳ�ಗಳ�";
      },
      w: function (c) {
        return c === 1 ? "ವಾರ" : "ವಾರಗಳ�";
      },
      d: function (c) {
        return c === 1 ? "ದಿನ" : "ದಿನಗಳ�";
      },
      h: function (c) {
        return c === 1 ? "ಗಂಟೆ" : "ಗಂಟೆಗಳ�";
      },
      m: function (c) {
        return c === 1 ? "ನಿಮಿಷ" : "ನಿಮಿಷಗಳ�";
      },
      s: function (c) {
        return c === 1 ? "ಸೆಕೆಂಡ�" : "ಸೆಕೆಂಡ�ಗಳ�";
      },
      ms: function (c) {
        return c === 1 ? "ಮಿಲಿಸೆಕೆಂಡ�" : "ಮಿಲಿಸೆಕೆಂಡ�ಗಳ�";
      }
    },
    ko: {
      y: "년",
      mo: "개월",
      w: "주�",
      d: "�",
      h: "시간",
      m: "분",
      s: "초",
      ms: "밀리 초",
      decimal: "."
    },
    ku: {
      y: "sal",
      mo: "meh",
      w: "hefte",
      d: "roj",
      h: "seet",
      m: "deqe",
      s: "saniye",
      ms: "mîlîçirk",
      decimal: ","
    },
    lo: {
      y: "ປີ",
      mo: "ເດືອນ",
      w: "ອາທິດ",
      d: "ມື້",
      h: "ຊົ່ວໂມງ",
      m: "ນາທີ",
      s: "ວິນາທີ",
      ms: "ມິນລິວິນາທີ",
      decimal: ","
    },
    lt: {
      y: function (c) {
        return c % 10 === 0 || (c % 100 >= 10 && c % 100 <= 20)
          ? "metų"
          : "metai";
      },
      mo: function (c) {
        return ["mėnuo", "mėnesiai", "mėnesių"][getLithuanianForm(c)];
      },
      w: function (c) {
        return ["savaitė", "savaitės", "savai�ių"][getLithuanianForm(c)];
      },
      d: function (c) {
        return ["diena", "dienos", "dienų"][getLithuanianForm(c)];
      },
      h: function (c) {
        return ["valanda", "valandos", "valandų"][getLithuanianForm(c)];
      },
      m: function (c) {
        return ["minutė", "minutės", "minu�ių"][getLithuanianForm(c)];
      },
      s: function (c) {
        return ["sekundė", "sekundės", "sekundžių"][getLithuanianForm(c)];
      },
      ms: function (c) {
        return ["milisekundė", "milisekundės", "milisekundžių"][
          getLithuanianForm(c)
        ];
      },
      decimal: ","
    },
    lv: {
      y: function (c) {
        return getLatvianForm(c) ? "gads" : "gadi";
      },
      mo: function (c) {
        return getLatvianForm(c) ? "mēnesis" : "mēneši";
      },
      w: function (c) {
        return getLatvianForm(c) ? "nedēļa" : "nedēļas";
      },
      d: function (c) {
        return getLatvianForm(c) ? "diena" : "dienas";
      },
      h: function (c) {
        return getLatvianForm(c) ? "stunda" : "stundas";
      },
      m: function (c) {
        return getLatvianForm(c) ? "minūte" : "minūtes";
      },
      s: function (c) {
        return getLatvianForm(c) ? "sekunde" : "sekundes";
      },
      ms: function (c) {
        return getLatvianForm(c) ? "milisekunde" : "milisekundes";
      },
      decimal: ","
    },
    mk: {
      y: function (c) {
        return c === 1 ? "година" : "години";
      },
      mo: function (c) {
        return c === 1 ? "ме�ец" : "ме�еци";
      },
      w: function (c) {
        return c === 1 ? "недела" : "недели";
      },
      d: function (c) {
        return c === 1 ? "ден" : "дена";
      },
      h: function (c) {
        return c === 1 ? "ча�" : "ча�а";
      },
      m: function (c) {
        return c === 1 ? "минута" : "минути";
      },
      s: function (c) {
        return c === 1 ? "�екунда" : "�екунди";
      },
      ms: function (c) {
        return c === 1 ? "мили�екунда" : "мили�екунди";
      },
      decimal: ","
    },
    mr: {
      y: function (c) {
        return c === 1 ? "वर�ष" : "वर�षे";
      },
      mo: function (c) {
        return c === 1 ? "महिना" : "महिने";
      },
      w: function (c) {
        return c === 1 ? "आठवडा" : "आठवडे";
      },
      d: "दिवस",
      h: "तास",
      m: function (c) {
        return c === 1 ? "मिनिट" : "मिनिटे";
      },
      s: "सेकंद",
      ms: "मिलिसेकंद"
    },
    ms: {
      y: "tahun",
      mo: "bulan",
      w: "minggu",
      d: "hari",
      h: "jam",
      m: "minit",
      s: "saat",
      ms: "milisaat",
      decimal: "."
    },
    nl: {
      y: "jaar",
      mo: function (c) {
        return c === 1 ? "maand" : "maanden";
      },
      w: function (c) {
        return c === 1 ? "week" : "weken";
      },
      d: function (c) {
        return c === 1 ? "dag" : "dagen";
      },
      h: "uur",
      m: function (c) {
        return c === 1 ? "minuut" : "minuten";
      },
      s: function (c) {
        return c === 1 ? "seconde" : "seconden";
      },
      ms: function (c) {
        return c === 1 ? "milliseconde" : "milliseconden";
      },
      decimal: ","
    },
    no: {
      y: "år",
      mo: function (c) {
        return "måned" + (c === 1 ? "" : "er");
      },
      w: function (c) {
        return "uke" + (c === 1 ? "" : "r");
      },
      d: function (c) {
        return "dag" + (c === 1 ? "" : "er");
      },
      h: function (c) {
        return "time" + (c === 1 ? "" : "r");
      },
      m: function (c) {
        return "minutt" + (c === 1 ? "" : "er");
      },
      s: function (c) {
        return "sekund" + (c === 1 ? "" : "er");
      },
      ms: function (c) {
        return "millisekund" + (c === 1 ? "" : "er");
      },
      decimal: ","
    },
    pl: {
      y: function (c) {
        return ["rok", "roku", "lata", "lat"][getPolishForm(c)];
      },
      mo: function (c) {
        return ["miesiąc", "miesiąca", "miesiące", "miesięcy"][
          getPolishForm(c)
        ];
      },
      w: function (c) {
        return ["tydzień", "tygodnia", "tygodnie", "tygodni"][getPolishForm(c)];
      },
      d: function (c) {
        return ["dzień", "dnia", "dni", "dni"][getPolishForm(c)];
      },
      h: function (c) {
        return ["godzina", "godziny", "godziny", "godzin"][getPolishForm(c)];
      },
      m: function (c) {
        return ["minuta", "minuty", "minuty", "minut"][getPolishForm(c)];
      },
      s: function (c) {
        return ["sekunda", "sekundy", "sekundy", "sekund"][getPolishForm(c)];
      },
      ms: function (c) {
        return ["milisekunda", "milisekundy", "milisekundy", "milisekund"][
          getPolishForm(c)
        ];
      },
      decimal: ","
    },
    pt: {
      y: function (c) {
        return "ano" + (c === 1 ? "" : "s");
      },
      mo: function (c) {
        return c === 1 ? "mês" : "meses";
      },
      w: function (c) {
        return "semana" + (c === 1 ? "" : "s");
      },
      d: function (c) {
        return "dia" + (c === 1 ? "" : "s");
      },
      h: function (c) {
        return "hora" + (c === 1 ? "" : "s");
      },
      m: function (c) {
        return "minuto" + (c === 1 ? "" : "s");
      },
      s: function (c) {
        return "segundo" + (c === 1 ? "" : "s");
      },
      ms: function (c) {
        return "milissegundo" + (c === 1 ? "" : "s");
      },
      decimal: ","
    },
    ro: {
      y: function (c) {
        return c === 1 ? "an" : "ani";
      },
      mo: function (c) {
        return c === 1 ? "lună" : "luni";
      },
      w: function (c) {
        return c === 1 ? "săptămână" : "săptămâni";
      },
      d: function (c) {
        return c === 1 ? "zi" : "zile";
      },
      h: function (c) {
        return c === 1 ? "oră" : "ore";
      },
      m: function (c) {
        return c === 1 ? "minut" : "minute";
      },
      s: function (c) {
        return c === 1 ? "secundă" : "secunde";
      },
      ms: function (c) {
        return c === 1 ? "milisecundă" : "milisecunde";
      },
      decimal: ","
    },
    ru: {
      y: function (c) {
        return ["лет", "год", "года"][getSlavicForm(c)];
      },
      mo: function (c) {
        return ["ме��цев", "ме��ц", "ме��ца"][getSlavicForm(c)];
      },
      w: function (c) {
        return ["недель", "недел�", "недели"][getSlavicForm(c)];
      },
      d: function (c) {
        return ["дней", "день", "дн�"][getSlavicForm(c)];
      },
      h: function (c) {
        return ["ча�ов", "ча�", "ча�а"][getSlavicForm(c)];
      },
      m: function (c) {
        return ["минут", "минута", "минуты"][getSlavicForm(c)];
      },
      s: function (c) {
        return ["�екунд", "�екунда", "�екунды"][getSlavicForm(c)];
      },
      ms: function (c) {
        return ["милли�екунд", "милли�екунда", "милли�екунды"][
          getSlavicForm(c)
        ];
      },
      decimal: ","
    },
    sq: {
      y: function (c) {
        return c === 1 ? "vit" : "vjet";
      },
      mo: "muaj",
      w: "javë",
      d: "ditë",
      h: "orë",
      m: function (c) {
        return "minut" + (c === 1 ? "ë" : "a");
      },
      s: function (c) {
        return "sekond" + (c === 1 ? "ë" : "a");
      },
      ms: function (c) {
        return "milisekond" + (c === 1 ? "ë" : "a");
      },
      decimal: ","
    },
    sr: {
      y: function (c) {
        return ["години", "година", "године"][getSlavicForm(c)];
      },
      mo: function (c) {
        return ["ме�еци", "ме�ец", "ме�еца"][getSlavicForm(c)];
      },
      w: function (c) {
        return ["недељи", "недеља", "недеље"][getSlavicForm(c)];
      },
      d: function (c) {
        return ["дани", "дан", "дана"][getSlavicForm(c)];
      },
      h: function (c) {
        return ["�ати", "�ат", "�ата"][getSlavicForm(c)];
      },
      m: function (c) {
        return ["минута", "минут", "минута"][getSlavicForm(c)];
      },
      s: function (c) {
        return ["�екунди", "�екунда", "�екунде"][getSlavicForm(c)];
      },
      ms: function (c) {
        return ["мили�екунди", "мили�екунда", "мили�екунде"][getSlavicForm(c)];
      },
      decimal: ","
    },
    ta: {
      y: function (c) {
        return c === 1 ? "வர�டம�" : "ஆண�ட�கள�";
      },
      mo: function (c) {
        return c === 1 ? "மாதம�" : "மாதங�கள�";
      },
      w: function (c) {
        return c === 1 ? "வாரம�" : "வாரங�கள�";
      },
      d: function (c) {
        return c === 1 ? "நாள�" : "நாட�கள�";
      },
      h: function (c) {
        return c === 1 ? "மணி" : "மணிநேரம�";
      },
      m: function (c) {
        return "நிமிட" + (c === 1 ? "ம�" : "ங�கள�");
      },
      s: function (c) {
        return "வினாடி" + (c === 1 ? "" : "கள�");
      },
      ms: function (c) {
        return "மில�லி விநாடி" + (c === 1 ? "" : "கள�");
      }
    },
    te: {
      y: function (c) {
        return "సంవత�స" + (c === 1 ? "రం" : "రాల");
      },
      mo: function (c) {
        return "నెల" + (c === 1 ? "" : "ల");
      },
      w: function (c) {
        return c === 1 ? "వారం" : "వారాల�";
      },
      d: function (c) {
        return "రోజ�" + (c === 1 ? "" : "ల�");
      },
      h: function (c) {
        return "గంట" + (c === 1 ? "" : "ల�");
      },
      m: function (c) {
        return c === 1 ? "నిమిషం" : "నిమిషాల�";
      },
      s: function (c) {
        return c === 1 ? "సెకన�" : "సెకన�ల�";
      },
      ms: function (c) {
        return c === 1 ? "మిల�లీసెకన�" : "మిల�లీసెకన�ల�";
      }
    },
    uk: {
      y: function (c) {
        return ["років", "рік", "роки"][getSlavicForm(c)];
      },
      mo: function (c) {
        return ["мі��ців", "мі��ць", "мі��ці"][getSlavicForm(c)];
      },
      w: function (c) {
        return ["тижнів", "тиждень", "тижні"][getSlavicForm(c)];
      },
      d: function (c) {
        return ["днів", "день", "дні"][getSlavicForm(c)];
      },
      h: function (c) {
        return ["годин", "година", "години"][getSlavicForm(c)];
      },
      m: function (c) {
        return ["хвилин", "хвилина", "хвилини"][getSlavicForm(c)];
      },
      s: function (c) {
        return ["�екунд", "�екунда", "�екунди"][getSlavicForm(c)];
      },
      ms: function (c) {
        return ["мілі�екунд", "мілі�екунда", "мілі�екунди"][getSlavicForm(c)];
      },
      decimal: ","
    },
    ur: {
      y: "سال",
      mo: function (c) {
        return c === 1 ? "م�ین�" : "م�ینے";
      },
      w: function (c) {
        return c === 1 ? "��ت�" : "��تے";
      },
      d: "دن",
      h: function (c) {
        return c === 1 ? "گھنٹ�" : "گھنٹے";
      },
      m: "منٹ",
      s: "سیکنڈ",
      ms: "ملی سیکنڈ",
      decimal: "."
    },
    sk: {
      y: function (c) {
        return ["rok", "roky", "roky", "rokov"][getCzechOrSlovakForm(c)];
      },
      mo: function (c) {
        return ["mesiac", "mesiace", "mesiace", "mesiacov"][
          getCzechOrSlovakForm(c)
        ];
      },
      w: function (c) {
        return ["týždeň", "týždne", "týždne", "týždňov"][
          getCzechOrSlovakForm(c)
        ];
      },
      d: function (c) {
        return ["deň", "dni", "dni", "dní"][getCzechOrSlovakForm(c)];
      },
      h: function (c) {
        return ["hodina", "hodiny", "hodiny", "hodín"][getCzechOrSlovakForm(c)];
      },
      m: function (c) {
        return ["minúta", "minúty", "minúty", "minút"][getCzechOrSlovakForm(c)];
      },
      s: function (c) {
        return ["sekunda", "sekundy", "sekundy", "sekúnd"][
          getCzechOrSlovakForm(c)
        ];
      },
      ms: function (c) {
        return ["milisekunda", "milisekundy", "milisekundy", "milisekúnd"][
          getCzechOrSlovakForm(c)
        ];
      },
      decimal: ","
    },
    sl: {
      y: function (c) {
        if (c % 10 === 1) {
          return "leto";
        } else if (c % 100 === 2) {
          return "leti";
        } else if (
          c % 100 === 3 ||
          c % 100 === 4 ||
          (Math.floor(c) !== c && c % 100 <= 5)
        ) {
          return "leta";
        } else {
          return "let";
        }
      },
      mo: function (c) {
        if (c % 10 === 1) {
          return "mesec";
        } else if (c % 100 === 2 || (Math.floor(c) !== c && c % 100 <= 5)) {
          return "meseca";
        } else if (c % 10 === 3 || c % 10 === 4) {
          return "mesece";
        } else {
          return "mesecev";
        }
      },
      w: function (c) {
        if (c % 10 === 1) {
          return "teden";
        } else if (c % 10 === 2 || (Math.floor(c) !== c && c % 100 <= 4)) {
          return "tedna";
        } else if (c % 10 === 3 || c % 10 === 4) {
          return "tedne";
        } else {
          return "tednov";
        }
      },
      d: function (c) {
        return c % 100 === 1 ? "dan" : "dni";
      },
      h: function (c) {
        if (c % 10 === 1) {
          return "ura";
        } else if (c % 100 === 2) {
          return "uri";
        } else if (c % 10 === 3 || c % 10 === 4 || Math.floor(c) !== c) {
          return "ure";
        } else {
          return "ur";
        }
      },
      m: function (c) {
        if (c % 10 === 1) {
          return "minuta";
        } else if (c % 10 === 2) {
          return "minuti";
        } else if (
          c % 10 === 3 ||
          c % 10 === 4 ||
          (Math.floor(c) !== c && c % 100 <= 4)
        ) {
          return "minute";
        } else {
          return "minut";
        }
      },
      s: function (c) {
        if (c % 10 === 1) {
          return "sekunda";
        } else if (c % 100 === 2) {
          return "sekundi";
        } else if (c % 100 === 3 || c % 100 === 4 || Math.floor(c) !== c) {
          return "sekunde";
        } else {
          return "sekund";
        }
      },
      ms: function (c) {
        if (c % 10 === 1) {
          return "milisekunda";
        } else if (c % 100 === 2) {
          return "milisekundi";
        } else if (c % 100 === 3 || c % 100 === 4 || Math.floor(c) !== c) {
          return "milisekunde";
        } else {
          return "milisekund";
        }
      },
      decimal: ","
    },
    sv: {
      y: "år",
      mo: function (c) {
        return "månad" + (c === 1 ? "" : "er");
      },
      w: function (c) {
        return "veck" + (c === 1 ? "a" : "or");
      },
      d: function (c) {
        return "dag" + (c === 1 ? "" : "ar");
      },
      h: function (c) {
        return "timm" + (c === 1 ? "e" : "ar");
      },
      m: function (c) {
        return "minut" + (c === 1 ? "" : "er");
      },
      s: function (c) {
        return "sekund" + (c === 1 ? "" : "er");
      },
      ms: function (c) {
        return "millisekund" + (c === 1 ? "" : "er");
      },
      decimal: ","
    },
    sw: {
      y: function (c) {
        return c === 1 ? "mwaka" : "miaka";
      },
      mo: function (c) {
        return c === 1 ? "mwezi" : "miezi";
      },
      w: "wiki",
      d: function (c) {
        return c === 1 ? "siku" : "masiku";
      },
      h: function (c) {
        return c === 1 ? "saa" : "masaa";
      },
      m: "dakika",
      s: "sekunde",
      ms: "milisekunde",
      decimal: "."
    },
    tr: {
      y: "yıl",
      mo: "ay",
      w: "hafta",
      d: "gün",
      h: "saat",
      m: "dakika",
      s: "saniye",
      ms: "milisaniye",
      decimal: ","
    },
    th: {
      y: "ปี",
      mo: "เดือน",
      w: "สัปดาห์",
      d: "วัน",
      h: "ชั่วโมง",
      m: "นาที",
      s: "วินาที",
      ms: "มิลลิวินาที",
      decimal: "."
    },
    vi: {
      y: "năm",
      mo: "tháng",
      w: "tuần",
      d: "ngày",
      h: "gi�",
      m: "phút",
      s: "giây",
      ms: "mili giây",
      decimal: ","
    },
    zh_CN: {
      y: "年",
      mo: "个月",
      w: "周",
      d: "天",
      h: "�时",
      m: "分钟",
      s: "秒",
      ms: "毫秒",
      decimal: "."
    },
    zh_TW: {
      y: "年",
      mo: "個月",
      w: "周",
      d: "天",
      h: "�時",
      m: "分�",
      s: "秒",
      ms: "毫秒",
      decimal: "."
    }
  };

  // You can create a humanizer, which returns a function with default
  // parameters.
  function humanizer(passedOptions) {
    var result = function humanizer(ms, humanizerOptions) {
      var options = assign({}, result, humanizerOptions || {});
      return doHumanization(ms, options);
    };

    return assign(
      result,
      {
        language: "en",
        spacer: " ",
        conjunction: "",
        serialComma: true,
        units: ["y", "mo", "w", "d", "h", "m", "s"],
        languages: {},
        round: false,
        unitMeasures: {
          y: 31557600000,
          mo: 2629800000,
          w: 604800000,
          d: 86400000,
          h: 3600000,
          m: 60000,
          s: 1000,
          ms: 1
        }
      },
      passedOptions
    );
  }

  // The main function is just a wrapper around a default humanizer.
  var humanizeDuration = humanizer({});

  // Build dictionary from options
  function getDictionary(options) {
    var languagesFromOptions = [options.language];

    if (has(options, "fallbacks")) {
      if (isArray(options.fallbacks) && options.fallbacks.length) {
        languagesFromOptions = languagesFromOptions.concat(options.fallbacks);
      } else {
        throw new Error("fallbacks must be an array with at least one element");
      }
    }

    for (var i = 0; i < languagesFromOptions.length; i++) {
      var languageToTry = languagesFromOptions[i];
      if (has(options.languages, languageToTry)) {
        return options.languages[languageToTry];
      } else if (has(LANGUAGES, languageToTry)) {
        return LANGUAGES[languageToTry];
      }
    }

    throw new Error("No language found.");
  }

  // doHumanization does the bulk of the work.
  function doHumanization(ms, options) {
    var i, len, piece;

    // Make sure we have a positive number.
    // Has the nice sideffect of turning Number objects into primitives.
    ms = Math.abs(ms);

    var dictionary = getDictionary(options);
    var pieces = [];

    // Start at the top and keep removing units, bit by bit.
    var unitName, unitMS, unitCount;
    for (i = 0, len = options.units.length; i < len; i++) {
      unitName = options.units[i];
      unitMS = options.unitMeasures[unitName];

      // What's the number of full units we can fit?
      if (i + 1 === len) {
        if (has(options, "maxDecimalPoints")) {
          // We need to use this expValue to avoid rounding functionality of toFixed call
          var expValue = Math.pow(10, options.maxDecimalPoints);
          var unitCountFloat = ms / unitMS;
          unitCount = parseFloat(
            (Math.floor(expValue * unitCountFloat) / expValue).toFixed(
              options.maxDecimalPoints
            )
          );
        } else {
          unitCount = ms / unitMS;
        }
      } else {
        unitCount = Math.floor(ms / unitMS);
      }

      // Add the string.
      pieces.push({
        unitCount: unitCount,
        unitName: unitName
      });

      // Remove what we just figured out.
      ms -= unitCount * unitMS;
    }

    var firstOccupiedUnitIndex = 0;
    for (i = 0; i < pieces.length; i++) {
      if (pieces[i].unitCount) {
        firstOccupiedUnitIndex = i;
        break;
      }
    }

    if (options.round) {
      var ratioToLargerUnit, previousPiece;
      for (i = pieces.length - 1; i >= 0; i--) {
        piece = pieces[i];
        piece.unitCount = Math.round(piece.unitCount);

        if (i === 0) {
          break;
        }

        previousPiece = pieces[i - 1];

        ratioToLargerUnit =
          options.unitMeasures[previousPiece.unitName] /
          options.unitMeasures[piece.unitName];
        if (
          piece.unitCount % ratioToLargerUnit === 0 ||
          (options.largest && options.largest - 1 < i - firstOccupiedUnitIndex)
        ) {
          previousPiece.unitCount += piece.unitCount / ratioToLargerUnit;
          piece.unitCount = 0;
        }
      }
    }

    var result = [];
    for (i = 0, pieces.length; i < len; i++) {
      piece = pieces[i];
      if (piece.unitCount) {
        result.push(
          render(piece.unitCount, piece.unitName, dictionary, options)
        );
      }

      if (result.length === options.largest) {
        break;
      }
    }

    if (result.length) {
      var delimiter;
      if (has(options, "delimiter")) {
        delimiter = options.delimiter;
      } else if (has(dictionary, "delimiter")) {
        delimiter = dictionary.delimiter;
      } else {
        delimiter = ", ";
      }

      if (!options.conjunction || result.length === 1) {
        return result.join(delimiter);
      } else if (result.length === 2) {
        return result.join(options.conjunction);
      } else if (result.length > 2) {
        return (
          result.slice(0, -1).join(delimiter) +
          (options.serialComma ? "," : "") +
          options.conjunction +
          result.slice(-1)
        );
      }
    } else {
      return render(
        0,
        options.units[options.units.length - 1],
        dictionary,
        options
      );
    }
  }

  function render(count, type, dictionary, options) {
    var decimal;
    if (has(options, "decimal")) {
      decimal = options.decimal;
    } else if (has(dictionary, "decimal")) {
      decimal = dictionary.decimal;
    } else {
      decimal = ".";
    }

    var countStr;
    if (typeof dictionary._formatCount === "function") {
      countStr = dictionary._formatCount(count, decimal);
    } else {
      countStr = count.toString().replace(".", decimal);
    }

    var dictionaryValue = dictionary[type];
    var word;
    if (typeof dictionaryValue === "function") {
      word = dictionaryValue(count);
    } else {
      word = dictionaryValue;
    }

    return countStr + options.spacer + word;
  }

  function assign(destination) {
    var source;
    for (var i = 1; i < arguments.length; i++) {
      source = arguments[i];
      for (var prop in source) {
        if (has(source, prop)) {
          destination[prop] = source[prop];
        }
      }
    }
    return destination;
  }

  function getArabicForm(c) {
    if (c === 1) {
      return 0;
    }
    if (c === 2) {
      return 1;
    }
    if (c > 2 && c < 11) {
      return 2;
    }
    return 0;
  }

  function getPolishForm(c) {
    if (c === 1) {
      return 0;
    } else if (Math.floor(c) !== c) {
      return 1;
    } else if (c % 10 >= 2 && c % 10 <= 4 && !(c % 100 > 10 && c % 100 < 20)) {
      return 2;
    } else {
      return 3;
    }
  }

  function getSlavicForm(c) {
    if (Math.floor(c) !== c) {
      return 2;
    } else if (
      (c % 100 >= 5 && c % 100 <= 20) ||
      (c % 10 >= 5 && c % 10 <= 9) ||
      c % 10 === 0
    ) {
      return 0;
    } else if (c % 10 === 1) {
      return 1;
    } else if (c > 1) {
      return 2;
    } else {
      return 0;
    }
  }

  function getCzechOrSlovakForm(c) {
    if (c === 1) {
      return 0;
    } else if (Math.floor(c) !== c) {
      return 1;
    } else if (c % 10 >= 2 && c % 10 <= 4 && c % 100 < 10) {
      return 2;
    } else {
      return 3;
    }
  }

  function getLithuanianForm(c) {
    if (c === 1 || (c % 10 === 1 && c % 100 > 20)) {
      return 0;
    } else if (
      Math.floor(c) !== c ||
      (c % 10 >= 2 && c % 100 > 20) ||
      (c % 10 >= 2 && c % 100 < 10)
    ) {
      return 1;
    } else {
      return 2;
    }
  }

  function getLatvianForm(c) {
    return c % 10 === 1 && c % 100 !== 11;
  }

  // We need to make sure we support browsers that don't have
  // `Array.isArray`, so we define a fallback here.
  var isArray =
    Array.isArray ||
    function (arg) {
      return Object.prototype.toString.call(arg) === "[object Array]";
    };

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  humanizeDuration.getSupportedLanguages = function getSupportedLanguages() {
    var result = [];
    for (var language in LANGUAGES) {
      if (has(LANGUAGES, language) && language !== "gr") {
        result.push(language);
      }
    }
    return result;
  };

  humanizeDuration.humanizer = humanizer;

  if (typeof define === "function" && define.amd) {
    define(function () {
      return humanizeDuration;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = humanizeDuration;
	global.humanizeDuration = humanizeDuration;
  } else {
    this.humanizeDuration = humanizeDuration;
  }
})();


class EventLog {
	constructor() {
		this.attributes = {};
		this.traces = [];
		this.extensions = {};
		this.globals = {};
		this.classifiers = {};
	}
}

class Trace {
	constructor() {
		this.attributes = {};
		this.events = [];
	}
}

class Event {
	constructor() {
		this.attributes = {};
	}
}

class LogGlobal {
	constructor() {
		this.attributes = {};
	}
}

class Attribute {
	constructor(value) {
		this.value = value;
		this.attributes = [];
	}
}


try {
	require('../../pm4js.js');
	module.exports = {EventLog: EventLog, Trace: Trace, Event: Event, LogGlobal: LogGlobal, Attribute: Attribute};
	global.EventLog = EventLog;
	global.Trace = Trace;
	global.Event = Event;
	global.LogGlobal = LogGlobal;
	global.Attribute = Attribute;
}
catch (err) {
	// not in node
}

class GeneralLogStatistics {
	static getStartActivities(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let act = trace.events[0].attributes[activityKey].value;
				let count = ret[act]
				if (count == null) {
					ret[act] = 1;
				}
				else {
					ret[act] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getEndActivities(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let act = trace.events[trace.events.length-1].attributes[activityKey].value;
				let count = ret[act]
				if (count == null) {
					ret[act] = 1;
				}
				else {
					ret[act] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getAttributeValues(log, attributeKey) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				let val = eve.attributes[attributeKey].value;
				let count = ret[val];
				if (count == null) {
					ret[val] = 1;
				}
				else {
					ret[val] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getVariants(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			let activities = [];
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey].value;
				activities.push(act);
			}
			activities = activities.toString();
			let count = ret[activities];
			if (count == null) {
				ret[activities] = 1
			}
			else {
				ret[activities] = count + 1;
			}
		}
		return ret;
	}
	
	static getEventAttributesList(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				for (let attr in eve.attributes) {
					ret[attr] = 0;
				}
			}
		}
		return Object.keys(ret);
	}
	
	static getCaseAttributesList(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let attr in trace.attributes) {
				ret[attr] = 0;
			}
		}
		return Object.keys(ret);
	}
	
	static numEvents(log) {
		let ret = 0;
		for (let trace of log.traces) {
			ret += trace.events.length;
		}
		return ret;
	}
	
	static getAverageSojournTime(log, activityKey="concept:name", completeTimestamp="time:timestamp", startTimestamp="time:timestamp") {
		let sojTime = {}
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				let acti = eve.attributes[activityKey].value;
				if (!(acti in sojTime)) {
					sojTime[acti] = [];
				}
				let st = eve.attributes[startTimestamp].value.getTime();
				let et = eve.attributes[completeTimestamp].value.getTime();
				let diff = (et - st)*1000;
				sojTime[acti].push(diff);
			}
		}
		for (let acti in sojTime) {
			let sum = 0.0;
			for (let val of sojTime[acti]) {
				sum += val;
			}
			sojTime[acti] = sum / sojTime[acti].length;
		}
		return sojTime;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {GeneralLogStatistics: GeneralLogStatistics};
	global.GeneralLogStatistics = GeneralLogStatistics;
}
catch (err) {
	// not in node
	console.log(err);
}


class XesImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlLog = xmlDoc.getElementsByTagName("log")[0];
		let eventLog = new EventLog();
		XesImporter.parseXmlObj(xmlLog, eventLog);
		let desc = "Log imported from a XES file"
		if ("name" in eventLog.attributes) {
			desc = eventLog.attributes["name"];
		}
		Pm4JS.registerObject(eventLog, "Log imported from a XES file");
		return eventLog;
	}
	
	static parseXmlObj(xmlObj, target) {
		for (let childId in xmlObj.childNodes) {
			let child = xmlObj.childNodes[childId];
			if (child.tagName == "string") {
				let xmlAttr = new Attribute(child.getAttribute("value"));
				target.attributes[child.getAttribute("key")] = xmlAttr;
				XesImporter.parseXmlObj(child, xmlAttr);
			}
			else if (child.tagName == "date") {
				let xmlAttr = new Attribute(new Date(child.getAttribute("value")));
				target.attributes[child.getAttribute("key")] = xmlAttr;
				XesImporter.parseXmlObj(child, xmlAttr);
			}
			else if (child.tagName == "float") {
				let xmlAttr = new Attribute(parseFloat(child.getAttribute("value")));
				target.attributes[child.getAttribute("key")] = xmlAttr;
				XesImporter.parseXmlObj(child, xmlAttr);
			}
			else if (child.tagName == "event") {
				let eve = new Event();
				target.events.push(eve);
				XesImporter.parseXmlObj(child, eve);
			}
			else if (child.tagName == "trace") {
				let trace = new Trace();
				target.traces.push(trace);
				XesImporter.parseXmlObj(child, trace);
			}
			else if (child.tagName == "extension") {
				target.extensions[child.getAttribute("name")] = [child.getAttribute("prefix"), child.getAttribute("uri")];
			}
			else if (child.tagName == "global") {
				let targetObj = new LogGlobal();
				target.globals[child.getAttribute("scope")] = targetObj;
				XesImporter.parseXmlObj(child, targetObj);
			}
			else if (child.tagName == "classifier") {
				target.classifiers[child.getAttribute("name")] = child.getAttribute("keys");
			}
		}
	}
}

try {
	require('../../../../pm4js.js');
	require('../../log.js');
	module.exports = {XesImporter: XesImporter};
	global.XesImporter = XesImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in node
}

Pm4JS.registerImporter("XesImporter", "apply", ["xes"], "XES Importer", "Alessandro Berti");

class CsvImporter {
	static apply(str, sep=CsvImporter.DEFAULT_SEPARATOR, quotechar=CsvImporter.DEFAULT_QUOTECHAR, caseId=CsvImporter.DEFAULT_CASE_ID, activity=CsvImporter.DEFAULT_ACTIVITY, timestamp=CsvImporter.DEFAULT_TIMESTAMP) {
		let csvArray = CsvImporter.parseCSV(str, sep=sep, quotechar=quotechar);
		let traces = {};
		let i = 1;
		let j = 0;
		let log = new EventLog();
		while (i < csvArray.length) {
			let eve = new Event();
			j = 0;
			while (j < csvArray[i].length) {
				eve.attributes[csvArray[0][j]] = new Attribute(csvArray[i][j]);
				j++;
			}
			eve.attributes[CsvImporter.DEFAULT_ACTIVITY] = eve.attributes[activity];
			eve.attributes[CsvImporter.DEFAULT_TIMESTAMP] = new Attribute(new Date(eve.attributes[timestamp].value));
			let thisCaseId = eve.attributes[caseId].value;
			let trace = null;
			if (thisCaseId in traces) {
				trace = traces[thisCaseId];
			}
			else {
				trace = new Trace();
				trace.attributes[CsvImporter.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE] = new Attribute(thisCaseId);
				traces[thisCaseId] = trace;
				log.traces.push(trace);
			}
			trace.events.push(eve);
			i++;
		}
		Pm4JS.registerObject(log, "Log imported from a CSV file");
		return log;
	}
	
	static parseCSV(str, sep=CsvImporter.DEFAULT_SEPARATOR, quotechar=CsvImporter.DEFAULT_QUOTECHAR) {
		var arr = [];
		var quote = false;  // 'true' means we're inside a quoted field

		// Iterate over each character, keep track of current row and column (of the returned array)
		for (var row = 0, col = 0, c = 0; c < str.length; c++) {
			var cc = str[c], nc = str[c+1];        // Current character, next character
			arr[row] = arr[row] || [];             // Create a new row if necessary
			arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

			// If the current character is a quotation mark, and we're inside a
			// quoted field, and the next character is also a quotation mark,
			// add a quotation mark to the current column and skip the next character
			if (cc == quotechar && quote && nc == quotechar) { arr[row][col] += cc; ++c; continue; }

			// If it's just one quotation mark, begin/end quoted field
			if (cc == quotechar) { quote = !quote; continue; }

			// If it's a comma and we're not in a quoted field, move on to the next column
			if (cc == sep && !quote) { ++col; continue; }

			// If it's a newline (CRLF) and we're not in a quoted field, skip the next character
			// and move on to the next row and move to column 0 of that new row
			if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

			// If it's a newline (LF or CR) and we're not in a quoted field,
			// move on to the next row and move to column 0 of that new row
			if (cc == '\n' && !quote) { ++row; col = 0; continue; }
			if (cc == '\r' && !quote) { ++row; col = 0; continue; }

			// Otherwise, append the current character to the current column
			arr[row][col] += cc;
		}
		return arr;
	}
}

CsvImporter.DEFAULT_CASE_ID = "case:concept:name";
CsvImporter.DEFAULT_ACTIVITY = "concept:name";
CsvImporter.DEFAULT_TIMESTAMP = "time:timestamp";
CsvImporter.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE = "concept:name";
CsvImporter.DEFAULT_CASE_PREFIX = "case:";
CsvImporter.DEFAULT_SEPARATOR = ',';
CsvImporter.DEFAULT_QUOTECHAR = '"';

try {
	require('../../../../pm4js.js');
	require('../../log.js');
	module.exports = {CsvImporter: CsvImporter};
	global.CsvImporter = CsvImporter;
}
catch (err) {
	// not in node
	console.log(err);
}

//Pm4JS.registerImporter("CsvImporter", "apply", ["csv"], "CSV Importer", "Alessandro Berti");

class CsvExporter {
	static apply(eventLog, sep=CsvExporter.DEFAULT_SEPARATOR, quotechar=CsvExporter.DEFAULT_QUOTECHAR, casePrefix=CsvExporter.DEFAULT_CASE_PREFIX) {
		let caseAttributes = GeneralLogStatistics.getCaseAttributesList(eventLog);
		let eventAttributes0 = GeneralLogStatistics.getEventAttributesList(eventLog);
		let eventAttributes = [];
		for (let ea of eventAttributes0) {
			if (!(ea.startsWith(casePrefix))) {
				eventAttributes.push(ea);
			}
		}
		let ret = [];
		let header = "";
		for (let ca of caseAttributes) {
			header += casePrefix+ca+sep;
		}
		for (let ea of eventAttributes) {
			header += ea+sep;
		}
		header = header.slice(0, -1);
		ret.push(header);
		for (let trace of eventLog.traces) {
			let pref = "";
			for (let ca of caseAttributes) {
				let val = trace.attributes[ca];
				if (val != null) {
					val = val.value;
					if (typeof val == "string" && val.includes(sep)) {
						pref += quotechar+val+quotechar+sep;
					}
					else if (typeof val == "object") {
						pref += val.toISOString()+sep;
					}
					else {
						pref += val+sep;
					}
				}
				else {
					pref += sep;
				}
			}
			for (let eve of trace.events) {
				let eveStr = ""+pref;
				for (let ea of eventAttributes) {
					let val = eve.attributes[ea];
					if (val != null) {
						val = val.value;
						if (typeof val == "string" && val.includes(sep)) {
							eveStr += quotechar+val+quotechar+sep;
						}
						else if (typeof val == "object") {
							eveStr += val.toISOString()+sep;
						}
						else {
							eveStr += val+sep;
						}
					}
					else {
						eveStr += sep;
					}
				}
				eveStr = eveStr.slice(0, -1);
				ret.push(eveStr);
			}
		}
		ret = ret.join('\n');
		return ret;
	}
}

CsvExporter.DEFAULT_CASE_ID = "case:concept:name";
CsvExporter.DEFAULT_ACTIVITY = "concept:name";
CsvExporter.DEFAULT_TIMESTAMP = "time:timestamp";
CsvExporter.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE = "concept:name";
CsvExporter.DEFAULT_CASE_PREFIX = "case:";
CsvExporter.DEFAULT_SEPARATOR = ',';
CsvExporter.DEFAULT_QUOTECHAR = '"';

try {
	require('../../../../pm4js.js');
	require('../../log.js');
	require('../../../../statistics/log/general.js');
	module.exports = {CsvExporter: CsvExporter};
	global.CsvExporter = CsvExporter;
}
catch (err) {
	// not in node
	console.log(err);
}

Pm4JS.registerExporter("CsvExporter", "apply", "EventLog", "csv", "text/csv", "CSV Exporter", "Alessandro Berti");


class XesExporter {
	static apply(eventLog) {
		let xmlDoc = document.createElement("log");
		XesExporter.exportXmlObjToDom(eventLog, xmlDoc);
		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		const xmlStr = serializer.serializeToString(xmlDoc);
		return xmlStr;
	}
	
	static exportXmlObjToDom(obj, dom) {
		for (let att in obj.attributes) {
			let attValue = obj.attributes[att].value;
			let xmlTag = null;
			let value = null;
			if (typeof attValue == "string") {
				xmlTag = "string";
				value = attValue;
			}
			else if (typeof attValue == "object") {
				xmlTag = "date";
				value = attValue.toISOString();
			}
			else if (typeof attValue == "number") {
				xmlTag = "float";
				value = ""+attValue;
			}
			
			if (value != null) {
				let attr = document.createElement(xmlTag);
				dom.appendChild(attr);
				attr.setAttribute("key", att);
				attr.setAttribute("value", value);
				XesExporter.exportXmlObjToDom(obj.attributes[att], attr);
			}
		}
		if (obj.constructor.name == "EventLog") {
			for (let ext in obj.extensions) {
				let extValue = obj.extensions[ext];
				let xmlExtension = document.createElement("extension");
				dom.appendChild(xmlExtension);
				xmlExtension.setAttribute("name", ext);
				xmlExtension.setAttribute("prefix", extValue[0]);
				xmlExtension.setAttribute("uri", extValue[1]);
			}
			for (let scope in obj.globals) {
				let global = obj.globals[scope];
				let xmlGlobal = document.createElement("global");
				dom.appendChild(xmlGlobal);
				xmlGlobal.setAttribute("scope", scope);
				XesExporter.exportXmlObjToDom(global, xmlGlobal);
			}
			for (let classifier in obj.classifiers) {
				let xmlClassifier = document.createElement("classifier");
				dom.appendChild(xmlClassifier);
				xmlClassifier.setAttribute("name", classifier);
				xmlClassifier.setAttribute("keys", obj.classifiers[classifier]);
			}
			for (let trace of obj.traces) {
				let xmlTrace = document.createElement("trace");
				dom.appendChild(xmlTrace);
				XesExporter.exportXmlObjToDom(trace, xmlTrace);
			}
		}
		else if (obj.constructor.name == "Trace") {
			for (let eve of obj.events) {
				let xmlEvent = document.createElement("event");
				dom.appendChild(xmlEvent);
				XesExporter.exportXmlObjToDom(eve, xmlEvent);
			}
		}
	}
}

try {
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
	require('../../../../pm4js.js');
	require('../../log.js');
	module.exports = {XesExporter: XesExporter};
	global.XesExporter = XesExporter;
}
catch (err) {
	// not in node
	console.log(err);
}

Pm4JS.registerExporter("XesExporter", "apply", "EventLog", "xes", "text/xml", "XES Exporter", "Alessandro Berti");

class PetriNet {
	constructor(name="EMPTY") {
		this.name = name;
		this.places = {};
		this.transitions = {};
		this.arcs = {};
	}
	
	addPlace(name) {
		let place = new PetriNetPlace(name);
		this.places[place] = place;
		return place;
	}
	
	addTransition(name, label) {
		let trans = new PetriNetTransition(name, label);
		this.transitions[trans] = trans;
		return trans;
	}
	
	addArcFromTo(source, target, weight=1) {
		if (source.constructor.name == target.constructor.name) {
			throw 'Petri nets are bipartite graphs';
		}
		let arc = new PetriNetArc(source, target, weight);
		source.outArcs[arc] = arc;
		target.inArcs[arc] = arc;
		this.arcs[arc] = arc;
		return arc;
	}
	
	removePlace(place) {
		for (let arcId in place.inArcs) {
			let arc = place.inArcs[arcId];
			delete this.arcs[arcId];
			delete arc.source.outArcs[arcId];
		}
		for (let arcId in place.outArcs) {
			let arc = place.outArcs[arcId];
			delete this.arcs[arcId];
			delete arc.target.inArcs[arcId];
		}
		delete this.places[place];
	}
	
	removeTransition(transition) {
		for (let arcId in transition.inArcs) {
			let arc = transition.inArcs[arcId];
			delete this.arcs[arcId];
			delete arc.target.outArcs[arcId];
		}
		for (let arcId in transition.outArcs) {
			let arc = transition.outArcs[arcId];
			delete this.arcs[arcId];
			delete arc.target.inArcs[arcId];
		}
		delete this.transitions[transition];
	}
	
	toString() {
		return "petriNet@@"+this.name;
	}
}

class PetriNetPlace {
	constructor(name) {
		this.name = name;
		this.inArcs = {};
		this.outArcs = {};
		this.properties = {};
	}
	
	toString() {
		return "place@@"+this.name;
	}
}

class PetriNetTransition {
	constructor(name, label) {
		this.name = name;
		this.label = label;
		this.inArcs = {};
		this.outArcs = {};
		this.properties = {};
	}
	
	toString() {
		return "transition@@"+this.name;
	}
	
	getPreMarking() {
		let preMarking = {}
		for (let arcKey in this.inArcs) {
			let arc = this.inArcs[arcKey];
			let sourcePlace = arc.source;
			preMarking[sourcePlace] = arc.weight;
		}
		return preMarking;
	}
	
	getPostMarking() {
		let postMarking = {};
		for (let arcKey in this.outArcs) {
			let arc = this.outArcs[arcKey];
			let targetPlace = arc.target;
			postMarking[targetPlace] = arc.weight;
		}
		return postMarking;
	}
	
	checkPreset(marking) {
		let preMarking = this.getPreMarking();
		for (let place in preMarking) {
			if (!(place in marking.tokens) || (marking.tokens[place] < preMarking[place])) {
				return false;
			}
		}
		return true;
	}
}


class PetriNetArc {
	constructor(source, target, weight=1) {
		this.source = source;
		this.target = target;
		this.weight = weight;
		this.properties = {};
	}
	
	toString() {
		return "arc@@"+this.source+"@@"+this.target;
	}
}

class Marking {
	constructor(net) {
		this.net = net;
		this.tokens = {};
	}
	
	toString() {
		let ret = "marking@@";
		let orderedKeys = Object.keys(this.tokens).sort();
		for (let place of orderedKeys) {
			ret += place + "=" + this.tokens[place] + ";"
		}
		return ret;
	}
	
	setTokens(place, tokens) {
		this.tokens[place] = tokens;
	}
	
	getEnabledTransitions() {
		let ret = [];
		for (let transKey in this.net.transitions) {
			let trans = this.net.transitions[transKey];
			if (trans.checkPreset(this)) {
				ret.push(trans);
			}
		}
		return ret;
	}
	
	execute(transition) {
		let newMarking = new Marking(this.net);
		for (let place in this.tokens) {
			newMarking.setTokens(place, this.tokens[place]);
		}
		let preMarking = transition.getPreMarking();
		let postMarking = transition.getPostMarking();
		for (let place in preMarking) {
			newMarking.tokens[place] -= preMarking[place];
		}
		for (let place in postMarking) {
			if (!(place in newMarking)) {
				newMarking.tokens[place] = postMarking[place];
			}
			else {
				newMarking.tokens[place] += postMarking[place];
			}
		}
		for (let place in newMarking.tokens) {
			if (newMarking.tokens[place] == 0) {
				delete newMarking.tokens[place];
			}
		}
		return newMarking;
	}
	
	copy() {
		let newMarking = new Marking(this.net);
		for (let place in this.tokens) {
			newMarking.setTokens(place, this.tokens[place]);
		}
		return newMarking;
	}
	
	equals(other) {
		let thisTokens = this.tokens;
		let otherTokens = other.tokens;
		for (let place in thisTokens) {
			if (!(place in otherTokens)) {
				return false;
			}
			else if (otherTokens[place] != thisTokens[place]) {
				return false;
			}
		}
		for (let place in otherTokens) {
			if (!(place in thisTokens)) {
				return false;
			}
		}
		return true;
	}
}

class AcceptingPetriNet {
	constructor(net, im, fm) {
		this.net = net;
		this.im = im;
		this.fm = fm;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {PetriNet: PetriNet, PetriNetPlace: PetriNetPlace, PetriNetTransition: PetriNetTransition, PetriNetArc: PetriNetArc, Marking: Marking, AcceptingPetriNet: AcceptingPetriNet};
	global.PetriNet = PetriNet;
	global.PetriNetPlace = PetriNetPlace;
	global.PetriNetTransition = PetriNetTransition;
	global.PetriNetArc = PetriNetArc;
	global.Marking = Marking;
	global.AcceptingPetriNet = AcceptingPetriNet;
}
catch (err) {
	// not in node
}

class PetriNetReduction {
	static apply(acceptingPetriNet, asPlugin=true) {
		PetriNetReduction.reduceSingleEntryTransitions(acceptingPetriNet.net);
		PetriNetReduction.reduceSingleExitTransitions(acceptingPetriNet.net);
		if (asPlugin) {
			Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net (reduced)");
		}
		return acceptingPetriNet;
	}
	
	static reduceSingleEntryTransitions(net) {
		let cont = true;
		while (cont) {
			cont = false;
			let singleEntryInvisibleTransitions = [];
			for (let transId in net.transitions) {
				let trans = net.transitions[transId];
				if (trans.label == null && Object.keys(trans.inArcs).length == 1) {
					singleEntryInvisibleTransitions.push(trans);
				}
			}
			for (let trans of singleEntryInvisibleTransitions) {
				let sourcePlace = null;
				let targetPlaces = [];
				for (let arcId in trans.inArcs) {
					let arc = trans.inArcs[arcId];
					sourcePlace = arc.source;
				}
				for (let arcId in trans.outArcs) {
					let arc = trans.outArcs[arcId];
					targetPlaces.push(arc.target);
				}
				if (Object.keys(sourcePlace.inArcs).length == 1 && Object.keys(sourcePlace.outArcs).length == 1) {
					let sourceTransition = null;
					for (let arcId in sourcePlace.inArcs) {
						sourceTransition = sourcePlace.inArcs[arcId].source;
					}
					net.removeTransition(trans);
					net.removePlace(sourcePlace);
					for (let p of targetPlaces) {
						net.addArcFromTo(sourceTransition, p);
					}
					cont = true;
					break;
				}
			}
		}
	}
	
	static reduceSingleExitTransitions(net) {
		let cont = true;
		while (cont) {
			cont = false;
			let singleExitInvisibleTransitions = [];
			for (let transId in net.transitions) {
				let trans = net.transitions[transId];
				if (trans.label == null && Object.keys(trans.outArcs).length == 1) {
					singleExitInvisibleTransitions.push(trans);
				}
			}
			for (let trans of singleExitInvisibleTransitions) {
				let targetPlace = null;
				let sourcePlaces = [];
				for (let arcId in trans.outArcs) {
					let arc = trans.outArcs[arcId];
					targetPlace = arc.target;
				}
				for (let arcId in trans.inArcs) {
					let arc = trans.inArcs[arcId];
					sourcePlaces.push(arc.source);
				}
				if (Object.keys(targetPlace.inArcs).length == 1 && Object.keys(targetPlace.outArcs).length == 1) {
					let targetTransition = null;
					for (let arcId in targetPlace.outArcs) {
						targetTransition = targetPlace.outArcs[arcId].target;
					}
					net.removeTransition(trans);
					net.removePlace(targetPlace);
					for (let p of sourcePlaces) {
						net.addArcFromTo(p, targetTransition);
					}
					cont = true;
					break;
				}
			}
		}
	}
}

try {
	require('../../pm4js.js');
	require('./petri_net.js');
	module.exports = {PetriNetReduction: PetriNetReduction};
	global.PetriNetReduction = PetriNetReduction;
}
catch (err) {
	console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("PetriNetReduction", "apply", ["AcceptingPetriNet"], "AcceptingPetriNet", "SESE Reduction of Accepting Petri Net", "Alessandro Berti");


class PnmlImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlPnml = xmlDoc.getElementsByTagName("pnml")[0];
		let petriNet = new PetriNet();
		let im = new Marking(petriNet);
		let fm = new Marking(petriNet);
		PnmlImporter.importRecursive(xmlPnml, petriNet, im, fm, {});
		let acceptingPetriNet = new AcceptingPetriNet(petriNet, im, fm);
		Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net imported from a PNML file");
		return acceptingPetriNet;
	}
	
	static importRecursive(pnmlObj, net, im, fm, objDict) {
		for (let childId in pnmlObj.childNodes) {
			let child = pnmlObj.childNodes[childId];
			if (child.tagName == "net" || child.tagName == "page") {
				PnmlImporter.importRecursive(child, net, im, fm, objDict);
			}
			else {
				if (child.tagName == "place") {
					let placeId = child.getAttribute("id");
					let placeName = placeId;
					let placeImOccurrences = 0;
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "name") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									placeName = child3.textContent;
								}
							}
						}
						else if (child2.tagName != null && child2.tagName.toLowerCase() == "initialmarking") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									placeImOccurrences = parseInt(child3.textContent);
								}
							}
						}
					}
					let place = net.addPlace(placeName);
					place.properties["id"] = placeId;
					if (placeImOccurrences > 0) {
						im.setTokens(place, placeImOccurrences);
					}
					objDict[placeId] = place;
				}
				else if (child.tagName == "transition") {
					let transId = child.getAttribute("id");
					let transLabel = transId;
					let visible = true;
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "name") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									transLabel = child3.textContent;
								}
							}
						}
						else if (child2.tagName == "toolspecific") {
							if (child2.getAttribute("activity") == "$invisible$") {
								visible = false;
							}
						}
					}
					let trans = null;
					if (visible) {
						trans = net.addTransition(transId, transLabel);
					}
					else {
						trans = net.addTransition(transId, null);
					}
					objDict[transId] = trans;
				}
				else if (child.tagName == "arc") {
					let arcId = child.getAttribute("id");
					let arcSource = objDict[child.getAttribute("source")];
					let arcTarget = objDict[child.getAttribute("target")];
					let arcWeight = 1;
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "inscription") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									arcWeight = parseInt(child3.textContent);
								}
							}
						}
					}
					net.addArcFromTo(arcSource, arcTarget, arcWeight);
				}
				else if (child.tagName == "finalmarkings") {
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "marking") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "place") {
									let placeId = child3.getAttribute("idref");
									let placeTokens = 0;
									for (let child4Id in child3.childNodes) {
										let child4 = child3.childNodes[child4Id];
										if (child4.tagName == "text") {
											placeTokens = parseInt(child4.textContent);
										}
									}
									let place = objDict[placeId];
									if (placeTokens > 0) {
										fm.setTokens(place, placeTokens);
									}
								}
							}
							break;
						}
					}
				}
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PnmlImporter: PnmlImporter};
	global.PnmlImporter = PnmlImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerImporter("PnmlImporter", "apply", ["pnml"], "PNML Importer", "Alessandro Berti");


class PnmlExporter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static apply(acceptingPetriNet) {
		let xmlDoc = document.createElement("pnml");
		let domNet = document.createElement("net");
		xmlDoc.appendChild(domNet);
		domNet.setAttribute("id", acceptingPetriNet.net.name);
		domNet.setAttribute("type", "http://www.pnml.org/version-2009/grammar/pnmlcoremodel");
		let page = document.createElement("page");
		page.setAttribute("id", PnmlExporter.uuidv4());
		domNet.appendChild(page);
		PnmlExporter.exportXmlObjToDom(acceptingPetriNet, page);
		let fm0Dom = document.createElementNS("", "finalMarkings");
		domNet.appendChild(fm0Dom);
		let fmDom = document.createElement("marking");
		fm0Dom.appendChild(fmDom);
		for (let placeId in acceptingPetriNet.fm.tokens) {
			let place = acceptingPetriNet.net.places[placeId];
			let placeDom = document.createElement("place");
			placeDom.setAttribute("idref", place.name);
			fmDom.appendChild(placeDom);
			let placeText = document.createElement("text");
			placeDom.appendChild(placeText);
			placeText.textContent = acceptingPetriNet.fm.tokens[placeId];
		}
		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		const xmlStr = serializer.serializeToString(xmlDoc);
		return xmlStr;
	}
	
	static exportXmlObjToDom(obj, dom) {
		for (let placeId in obj.net.places) {
			let place = obj.net.places[placeId];
			let domPlace = document.createElement("place");
			domPlace.setAttribute("id", place.name);
			dom.appendChild(domPlace);
			let placeName = document.createElement("name");
			domPlace.appendChild(placeName);
			let placeNameText = document.createElement("text");
			placeName.appendChild(placeNameText);
			placeNameText.textContent = place.name;
			if (place in obj.im.tokens) {
				let initialMarking = document.createElementNS("", "initialMarking");
				domPlace.appendChild(initialMarking);
				let initialMarkingText = document.createElement("text");
				initialMarking.appendChild(initialMarkingText);
				initialMarkingText.textContent = obj.im.tokens[place];
			}
		}
		for (let transId in obj.net.transitions) {
			let trans = obj.net.transitions[transId];
			let domTrans = document.createElement("transition");
			domTrans.setAttribute("id", trans.name);
			dom.appendChild(domTrans);
			let transName = document.createElement("name");
			domTrans.appendChild(transName);
			let transNameText = document.createElement("text");
			transName.appendChild(transNameText);
			if (trans.label == null) {
				transNameText.textContent = trans.name;
			}
			else {
				transNameText.textContent = trans.label;
			}
			if (trans.label == null) {
				let toolSpecific = document.createElement("toolspecific");
				domTrans.appendChild(toolSpecific);
				toolSpecific.setAttribute("activity", "$invisible$");
				toolSpecific.setAttribute("tool", "ProM");
				toolSpecific.setAttribute("version", "6.4");
				toolSpecific.setAttribute("localNodeID", PnmlExporter.uuidv4());
			}
		}
		for (let arcId in obj.net.arcs) {
			let arc = obj.net.arcs[arcId];
			let domArc = document.createElement("arc");
			domArc.setAttribute("source", arc.source.name);
			domArc.setAttribute("target", arc.target.name);
			domArc.setAttribute("id", PnmlExporter.uuidv4());
			dom.appendChild(domArc);
			let inscription = document.createElement("inscription");
			domArc.appendChild(inscription);
			let inscriptionText = document.createElement("text");
			inscription.appendChild(inscriptionText);
			inscriptionText.textContent = arc.weight;
		}
	}
}

try {
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PnmlExporter: PnmlExporter};
	global.PnmlExporter = PnmlExporter;
}
catch (err) {
	// not in node
	console.log(err);
}

Pm4JS.registerExporter("PnmlExporter", "apply", "AcceptingPetriNet", "pnml", "text/xml", "Petri net Exporter (.pnml)", "Alessandro Berti");


class ProcessTreeOperator {
}

ProcessTreeOperator.SEQUENCE = "sequence";
ProcessTreeOperator.PARALLEL = "and";
ProcessTreeOperator.INCLUSIVE = "or";
ProcessTreeOperator.EXCLUSIVE = "xor";
ProcessTreeOperator.LOOP = "xorLoop";

class ProcessTree {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	constructor(parentNode, operator, label) {
		this.parentNode = parentNode;
		this.operator = operator;
		this.label = label;
		this.id = ProcessTree.uuidv4();
		this.children = [];
	}
	
	toString() {
		if (this.operator == null) {
			if (this.label == null) {
				return "tau";
			}
			else {
				return "'"+this.label+"'";
			}
		}
		else {
			let opMapping = {};
			opMapping[ProcessTreeOperator.SEQUENCE] = "->";
			opMapping[ProcessTreeOperator.PARALLEL] = "+";
			opMapping[ProcessTreeOperator.INCLUSIVE] = "O";
			opMapping[ProcessTreeOperator.EXCLUSIVE] = "X";
			opMapping[ProcessTreeOperator.LOOP] = "*";
			let childRepr = [];
			for (let n of this.children) {
				childRepr.push(n.toString());
			}
			return opMapping[this.operator] + " ( " + childRepr.join(', ') + " ) ";
		}
	}
}

try {
	require('../../pm4js.js');
	module.exports = { ProcessTree: ProcessTree, ProcessTreeOperator: ProcessTreeOperator };
	global.ProcessTree = ProcessTree;
	global.ProcessTreeOperator = ProcessTreeOperator;
}
catch (err) {
	// not in Node
	console.log(err);
}


class ProcessTreeToPetriNetConverter {
	static apply(processTree) {
		let nodes = ProcessTreeToPetriNetConverter.orderBottomUpNodes(processTree);
		let petriNet = new PetriNet();
		let im = new Marking(petriNet);
		let fm = new Marking(petriNet);
		let sourcePlaces = {};
		let targetPlaces = {};
		let i = 0;
		while (i < nodes.length) {
			let source = petriNet.addPlace("source_"+nodes[i].id);
			let target = petriNet.addPlace("target_"+nodes[i].id);
			sourcePlaces[nodes[i].id] = source;
			targetPlaces[nodes[i].id] = target;
			if (nodes[i].label != null || nodes[i].operator == null) {
				// leaf node
				let addedTrans = petriNet.addTransition("trans_"+nodes[i].id, nodes[i].label);
				petriNet.addArcFromTo(source, addedTrans);
				petriNet.addArcFromTo(addedTrans, target);
			}
			else if (nodes[i].operator == ProcessTreeOperator.SEQUENCE) {
				let j = 0;
				let curr = source;
				while (j < nodes[i].children.length) {
					let thisNode = nodes[i].children[j];
					let thisSource = sourcePlaces[thisNode.id];
					let thisTarget = targetPlaces[thisNode.id];
					let inv1 = petriNet.addTransition("transSeq_"+nodes[i].id+"_"+j, null);
					petriNet.addArcFromTo(curr, inv1);
					petriNet.addArcFromTo(inv1, thisSource);
					curr = thisTarget;
					j++;
				}
				let inv1 = petriNet.addTransition("transSeq_"+nodes[i].id+"_last", null);
				petriNet.addArcFromTo(curr, inv1);
				petriNet.addArcFromTo(inv1, target);
			}
			else if (nodes[i].operator == ProcessTreeOperator.PARALLEL) {
				let j = 0;
				let inv1 = petriNet.addTransition("transParallel_"+nodes[i].id+"_first", null);
				let inv2 = petriNet.addTransition("transParallel_"+nodes[i].id+"_last", null);
				while (j < nodes[i].children.length) {
					let thisNode = nodes[i].children[j];
					let thisSource = sourcePlaces[thisNode.id];
					let thisTarget = targetPlaces[thisNode.id];
					petriNet.addArcFromTo(source, inv1);
					petriNet.addArcFromTo(inv1, thisSource);
					petriNet.addArcFromTo(thisTarget, inv2);
					petriNet.addArcFromTo(inv2, target);
					j++;
				}
			}
			else if (nodes[i].operator == ProcessTreeOperator.EXCLUSIVE) {
				let j = 0;
				while (j < nodes[i].children.length) {
					let thisNode = nodes[i].children[j];
					let thisSource = sourcePlaces[thisNode.id];
					let thisTarget = targetPlaces[thisNode.id];
					let inv1 = petriNet.addTransition("transXor_"+nodes[i].id+"_"+j+"_first", null);
					let inv2 = petriNet.addTransition("transXor_"+nodes[i].id+"_"+j+"_last", null);
					petriNet.addArcFromTo(source, inv1);
					petriNet.addArcFromTo(inv1, thisSource);
					petriNet.addArcFromTo(thisTarget, inv2);
					petriNet.addArcFromTo(inv2, target);
					j++;
				}
			}
			else if (nodes[i].operator == ProcessTreeOperator.LOOP) {
				let inv1 = petriNet.addTransition("transLoop_"+nodes[i].id+"_first", null);
				let inv2 = petriNet.addTransition("transLoop_"+nodes[i].id+"_last", null);
				let inv3 = petriNet.addTransition("transLoop_"+nodes[i].id+"_loop1", null);
				let inv4 = petriNet.addTransition("transLoop_"+nodes[i].id+"_loop2", null);
				let doNode = nodes[i].children[0];
				let doNodeSource = sourcePlaces[doNode.id];
				let doNodeTarget = targetPlaces[doNode.id];
				let redoNode = nodes[i].children[1];
				let redoNodeSource = sourcePlaces[redoNode.id];
				let redoNodeTarget = targetPlaces[redoNode.id];
				petriNet.addArcFromTo(source, inv1);
				petriNet.addArcFromTo(inv1, doNodeSource);
				petriNet.addArcFromTo(doNodeTarget, inv2);
				petriNet.addArcFromTo(inv2, target);
				petriNet.addArcFromTo(target, inv3);
				petriNet.addArcFromTo(inv3, redoNodeSource);
				petriNet.addArcFromTo(redoNodeTarget, inv4);
				petriNet.addArcFromTo(inv4, source);
			}
			i++;
		}
		let source = petriNet.addPlace("generalSource");
		let sink = petriNet.addPlace("generalSink");
		let inv1 = petriNet.addTransition("generalSource_trans", null);
		let inv2 = petriNet.addTransition("generalSink_trans", null);
		petriNet.addArcFromTo(source, inv1);
		petriNet.addArcFromTo(inv1, sourcePlaces[processTree.id]);
		petriNet.addArcFromTo(targetPlaces[processTree.id], inv2);
		petriNet.addArcFromTo(inv2, sink);
		im.setTokens(source, 1);
		fm.setTokens(sink, 1);
		let acceptingPetriNet = new AcceptingPetriNet(petriNet, im, fm);
		PetriNetReduction.apply(acceptingPetriNet, false);

		Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net");

		return acceptingPetriNet;
	}
	
	static sortNodes(nodes) {
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < nodes.length - 1) {
				let j = i + 1;
				while (j < nodes.length) {
					if (nodes[j].parentNode == nodes[i]) {
						cont = true;
						let temp = nodes[i];
						nodes[i] = nodes[j];
						nodes[j] = temp;
					}
					j++;
				}
				i++;
			}
		}		
		return nodes;
	}
	
	static orderBottomUpNodes(processTree) {
		let descendants = {};
		ProcessTreeToPetriNetConverter.findAllDescendants(processTree, descendants);
		let nodes = Object.values(descendants);
		nodes = ProcessTreeToPetriNetConverter.sortNodes(nodes);
		return nodes;
	}
	
	static findAllDescendants(processTree, descendants) {
		descendants[processTree.id] = processTree;
		if (processTree.operator == ProcessTreeOperator.LOOP) {
			ProcessTreeToPetriNetConverter.findAllDescendants(processTree.children[0], descendants);
			ProcessTreeToPetriNetConverter.findAllDescendants(processTree.children[1], descendants);
		}
		else {
			for (let child of processTree.children) {
				ProcessTreeToPetriNetConverter.findAllDescendants(child, descendants);
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../../process_tree/process_tree.js');
	require('../../petri_net/petri_net.js');
	require('../../petri_net/reduction.js');
	module.exports = {ProcessTreeToPetriNetConverter: ProcessTreeToPetriNetConverter};
	global.ProcessTreeToPetriNetConverter = ProcessTreeToPetriNetConverter;
}
catch (err) {
	console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("ProcessTreeToPetriNetConverter", "apply", ["ProcessTree"], "AcceptingPetriNet", "Convert Process Tree to an Accepting Petri Net", "Alessandro Berti");


class PtmlImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlPtml = xmlDoc.getElementsByTagName("ptml")[0];
		var xmlProcessTree = xmlPtml.getElementsByTagName("processTree")[0];
		let processTree = PtmlImporter.importFromXml(xmlProcessTree);
		Pm4JS.registerObject(processTree, "Process Tree imported from a PTML file");
		return processTree;
	}
	
	static importFromXml(xmlProcessTree) {
		let nodes = {};
		for (let childId in xmlProcessTree.childNodes) {
			let child = xmlProcessTree.childNodes[childId];
			if (child.tagName != null) {
				let elId = child.getAttribute("id");
				let elLabel = child.getAttribute("name");
				let elOperator = null;
				if (child.tagName == "and") {
					elOperator = ProcessTreeOperator.PARALLEL;
					elLabel = null;
				}
				else if (child.tagName == "xorLoop") {
					elOperator = ProcessTreeOperator.LOOP;
					elLabel = null;
				}
				else if (child.tagName == "sequence") {
					elOperator = ProcessTreeOperator.SEQUENCE;
					elLabel = null;
				}
				else if (child.tagName == "or") {
					elOperator = ProcessTreeOperator.INCLUSIVE;
					elLabel = null;
				}
				else if (child.tagName == "xor") {
					elOperator = ProcessTreeOperator.EXCLUSIVE;
					elLabel = null;
				}
				else if (child.tagName == "automaticTask") {
					elLabel = null;
				}
				
				if (child.tagName != "parentsNode") {
					let tree = new ProcessTree(null, elOperator, elLabel);
					nodes[elId] = tree;
				}
				else {
					let sourceId = child.getAttribute("sourceId");
					let targetId = child.getAttribute("targetId");
					nodes[targetId].parentNode = nodes[sourceId];
					nodes[sourceId].children.push(nodes[targetId]);
				}
			}
		}
		for (let nodeId in nodes) {
			let node = nodes[nodeId];
			if (node.parentNode == null) {
				return node;
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../process_tree.js');
	module.exports = {PtmlImporter: PtmlImporter};
	global.PtmlImporter = PtmlImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerImporter("PtmlImporter", "apply", ["ptml"], "PTML Importer", "Alessandro Berti");


class ProcessTreeVanillaVisualizer {
	static nodeUuid(uuid) {
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(processTree) {
		let descendants = {};
		ProcessTreeVanillaVisualizer.findAllDescendants(processTree, descendants);
		let ret = [];
		ret.push("digraph G {");
		for (let desc in descendants) {
			let tree = descendants[desc];
			let treeId = ProcessTreeVanillaVisualizer.nodeUuid(desc);
			let nodeLabel = "";
			if (tree.label != null) {
				nodeLabel = tree.label;
			}
			
			if (tree.operator == ProcessTreeOperator.SEQUENCE) {
				nodeLabel = "seq";
			}
			else if (tree.operator == ProcessTreeOperator.PARALLEL) {
				nodeLabel = "and";
			}
			else if (tree.operator == ProcessTreeOperator.INCLUSIVE) {
				nodeLabel = "or";
			}
			else if (tree.operator == ProcessTreeOperator.EXCLUSIVE) {
				nodeLabel = "xor";
			}
			else if (tree.operator == ProcessTreeOperator.LOOP) {
				nodeLabel = "xorLoop";
			}
			
			if (tree.operator == null && tree.label == null) {
				ret.push(treeId+" [shape=point, label=\"\", style=filled, fillcolor=black]");
			}
			else {
				ret.push(treeId+" [shape=ellipse; label=\""+nodeLabel+"\"]");
			}
		}
		for (let desc in descendants) {
			let tree = descendants[desc];
			let treeId = ProcessTreeVanillaVisualizer.nodeUuid(desc);
			let childCount = 0;
			for (let child of tree.children) {
				let childId = ProcessTreeVanillaVisualizer.nodeUuid(child.id);
				ret.push(treeId+" -> "+childId+" [dir=none]");
				childCount++;
				if (tree.operator == ProcessTreeOperator.LOOP) {
					if (childCount == 2) {
						break;
					}
				}
			}
		}
		ret.push("}");
		return ret.join('\n');
	}
	
	static findAllDescendants(processTree, descendants) {
		descendants[processTree.id] = processTree;
		if (processTree.operator == ProcessTreeOperator.LOOP) {
			ProcessTreeVanillaVisualizer.findAllDescendants(processTree.children[0], descendants);
			ProcessTreeVanillaVisualizer.findAllDescendants(processTree.children[1], descendants);
		}
		else {
			for (let child of processTree.children) {
				ProcessTreeVanillaVisualizer.findAllDescendants(child, descendants);
			}
		}
	}
}

try {
	require('../../pm4js.js');
	require('../../objects/process_tree/process_tree.js');
	module.exports = {ProcessTreeVanillaVisualizer: ProcessTreeVanillaVisualizer};
	global.ProcessTreeVanillaVisualizer = ProcessTreeVanillaVisualizer;
}
catch (err) {
	// not in node
	console.log(err);
}


class PetriNetVanillaVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = PetriNetVanillaVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(acceptingPetriNet, debug=false) {
		let petriNet = acceptingPetriNet.net;
		let im = acceptingPetriNet.im;
		let fm = acceptingPetriNet.fm;
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		ret.push("rankdir=\"LR\"");
		for (let placeKey in petriNet.places) {
			let place = petriNet.places[placeKey];
			let nUid = PetriNetVanillaVisualizer.nodeUuid();
			let fillColor = "white";
			if (place in im.tokens) {
				fillColor = "green";
			}
			else if (place in fm.tokens) {
				fillColor = "orange";
			}
			let placeLabel = " ";
			if (debug == true) {
				placeLabel = placeKey;
			}
			ret.push(nUid+" [shape=circle, label=\""+placeLabel+"\", style=filled, fillcolor="+fillColor+"]");
			uidMap[place] = nUid;
		}
		for (let transKey in petriNet.transitions) {
			let trans = petriNet.transitions[transKey];
			let nUid = PetriNetVanillaVisualizer.nodeUuid();
			if (trans.label != null) {
				ret.push(nUid+" [shape=box, label=\""+trans.label+"\"]");
			}
			else {
				if (debug == true) {
					ret.push(nUid+" [shape=box, label=\""+trans.name+"\"]");
				}
				else {
					ret.push(nUid+" [shape=box, label=\" \", style=filled, fillcolor=black]");
				}
			}
			uidMap[trans] = nUid;
		}
		for (let arcKey in petriNet.arcs) {
			let arc = petriNet.arcs[arcKey];
			let uid1 = uidMap[arc.source];
			let uid2 = uidMap[arc.target];
			ret.push(uid1+" -> "+uid2+"");
		}
		ret.push("}");
		return ret.join('\n');
	}
}

try {
	require('../../pm4js.js');
	module.exports = {PetriNetVanillaVisualizer: PetriNetVanillaVisualizer};
	global.PetriNetVanillaVisualizer = PetriNetVanillaVisualizer;
}
catch (err) {
	// not in node
}

class LogGeneralFiltering {
	static filterStartActivities(log, activitiesArray, positive=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let bo = activitiesArray.includes(trace.events[0].attributes[activityKey].value);
				if ((bo && positive) || (!bo && !positive)) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterEndActivities(log, activitiesArray, positive=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let bo = activitiesArray.includes(trace.events[trace.events.length - 1].attributes[activityKey].value);
				if ((bo && positive) || (!bo && !positive)) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterVariants(log, variantsArray, positive=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let varArray = [];
			for (let eve of trace.events) {
				varArray.push(eve.attributes[activityKey].value);
			}
			varArray = varArray.toString();
			let bo = variantsArray.includes(varArray);
			if ((bo && positive) || (!bo && !positive)) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterCaseSize(log, minSize, maxSize) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (minSize <= trace.events.length && trace.events.length <= maxSize) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterCaseDuration(log, minDuration, maxDuration, timestamp_key="time:timestamp") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let st = trace.events[0].attributes[timestamp_key].value.getTime();
				let et = trace.events[trace.events.length-1].attributes[timestamp_key].value.getTime();
				let diff = (et - st) / 1000;
				if (minDuration <= diff && diff <= maxDuration) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterCasesHavingEventAttributeValue(log, valuesArray, positive=true, attributeKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let bo = false;
			for (let eve of trace.events) {
				let val = eve.attributes[attributeKey].value;
				bo = bo || valuesArray.includes(val);
			}
			if ((bo && positive) || (!bo && !positive)) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterEventsHavingEventAttributeValues(log, valuesArray, addEvenIfEmpty=false, positive=true, attributeKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let newTrace = new Trace();
			for (let eve of trace.events) {
				let val = eve.attributes[attributeKey].value;
				let bo = valuesArray.includes(val);
				if ((bo && positive) || (!bo && !positive)) {
					newTrace.events.push(eve);
				}
			}
			if (addEvenIfEmpty || newTrace.events.length > 0) {
				filteredLog.traces.push(newTrace);
			}
		}
		return filteredLog;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {LogGeneralFiltering: LogGeneralFiltering};
	global.LogGeneralFiltering = LogGeneralFiltering;
}
catch (err) {
	// not in Node
}

class FlowerMiner {
	static apply(eventLog, activityKey="concept:name") {
		let activities = GeneralLogStatistics.getAttributeValues(eventLog, activityKey);
		let loop = new ProcessTree(null, ProcessTreeOperator.LOOP, null);
		let xor = new ProcessTree(loop, ProcessTreeOperator.EXCLUSIVE, null);
		let redo = new ProcessTree(loop, null, null);
		loop.children.push(xor);
		loop.children.push(redo);
		for (let act in activities) {
			let actNode = new ProcessTree(xor, null, act);
			xor.children.push(actNode);
		}
		Pm4JS.registerObject(loop, "Process Tree (Flower Miner)");
		return loop;
	}
}

try {
	require('../../../pm4js.js');
	require('../../../objects/log/log.js');
	require('../../../objects/process_tree/process_tree.js');
	require('../../../statistics/log/general.js');
	module.exports = {FlowerMiner: FlowerMiner};
	global.FlowerMiner = FlowerMiner;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerAlgorithm("FlowerMiner", "apply", ["EventLog"], "ProcessTree", "Mine a Process Tree using the Flower Miner", "Alessandro Berti");


class TokenBasedReplayResult {
	constructor(result, acceptingPetriNet) {
		this.acceptingPetriNet = acceptingPetriNet;
		this.result = result;
		this.totalConsumed = 0;
		this.totalProduced = 0;
		this.totalMissing = 0;
		this.totalRemaining = 0;
		this.transExecutions = {};
		this.arcExecutions = {};
		this.totalConsumedPerPlace = {};
		this.totalProducedPerPlace = {};
		this.totalMissingPerPlace = {};
		this.totalRemainingPerPlace = {};
		for (let t in acceptingPetriNet.net.transitions) {
			this.transExecutions[t] = 0;
		}
		for (let a in acceptingPetriNet.net.arcs) {
			this.arcExecutions[a] = 0;
		}
		for (let p in acceptingPetriNet.net.places) {
			this.totalConsumedPerPlace[p] = 0;
			this.totalProducedPerPlace[p] = 0;
			this.totalMissingPerPlace[p] = 0;
			this.totalRemainingPerPlace[p] = 0;
		}
		this.totalTraces = this.result.length;
		this.fitTraces = 0;
		this.logFitness = 0.0;
		this.compute();
	}
	
	compute() {
		for (let res of this.result) {
			if (res["isFit"]) {
				this.fitTraces++;
			}
			this.totalConsumed += res["consumed"];
			this.totalProduced += res["produced"];
			this.totalMissing += res["missing"];
			this.totalRemaining += res["remaining"];
			let fitMC = 0.0;
			let fitRP = 0.0;
			if (this.totalConsumed > 0) {
				fitMC = 1.0 - this.totalMissing / this.totalConsumed;
			}
			if (this.totalProduced > 0) {
				fitRP = 1.0 - this.totalRemaining / this.totalProduced;
			}
			this.logFitness = 0.5*fitMC + 0.5*fitRP;
			for (let t of res["visitedTransitions"]) {
				this.transExecutions[t]++;
				for (let a in t.inArcs) {
					this.arcExecutions[a]++;
				}
				for (let a in t.outArcs) {
					this.arcExecutions[a]++;
				}
			}
			for (let p in this.acceptingPetriNet.net.places) {
				this.totalConsumedPerPlace[p] += res["consumedPerPlace"][p];
				this.totalProducedPerPlace[p] += res["producedPerPlace"][p];
				this.totalMissingPerPlace[p] += res["missingPerPlace"][p];
				this.totalRemainingPerPlace[p] += res["remainingPerPlace"][p];
			}
		}
	}
}

class TokenBasedReplay {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name", reachFm=true) {
		let invisibleChain = TokenBasedReplay.buildInvisibleChain(acceptingPetriNet.net);
		let transitionsMap = {};
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			if (trans.label != null) {
				transitionsMap[trans.label] = trans;
			}
		}
		let dictioResultsVariant = {};
		let ret = [];
		for (let trace of eventLog.traces) {
			let arrActivities = TokenBasedReplay.getArrActivities(trace, activityKey);
			if (arrActivities in dictioResultsVariant) {
				ret.push(dictioResultsVariant[arrActivities]);
			}
			else {
				let thisRes = TokenBasedReplay.performTbr(arrActivities, transitionsMap, acceptingPetriNet, invisibleChain, reachFm);
				dictioResultsVariant[arrActivities] = thisRes;
				ret.push(thisRes);
			}
		}
		let finalResult = new TokenBasedReplayResult(ret, acceptingPetriNet);
		
		Pm4JS.registerObject(finalResult, "Token-Based Replay Result");
		
		return finalResult;
	}
	
	static performTbr(activities, transitionsMap, acceptingPetriNet, invisibleChain, reachFm) {
		let marking = acceptingPetriNet.im.copy();
		let consumed = 0;
		let produced = 0;
		let missing = 0;
		let remaining = 0;
		let consumedPerPlace = {};
		let producedPerPlace = {};
		let missingPerPlace = {};
		let remainingPerPlace = {};
		for (let placeId in acceptingPetriNet.net.places) {
			consumedPerPlace[placeId] = 0;
			producedPerPlace[placeId] = 0;
			missingPerPlace[placeId] = 0;
			remainingPerPlace[placeId] = 0;
		}
		for (let place in acceptingPetriNet.im.tokens) {
			produced += acceptingPetriNet.im.tokens[place];
			producedPerPlace[place] += acceptingPetriNet.im.tokens[place];
		}
		for (let place in acceptingPetriNet.fm.tokens) {
			consumed += acceptingPetriNet.fm.tokens[place];
			consumedPerPlace[place] += acceptingPetriNet.fm.tokens[place];
		}
		let visitedTransitions = [];
		let visitedMarkings = [];
		let missingActivitiesInModel = [];
		for (let act of activities) {
			if (act in transitionsMap) {
				let trans = transitionsMap[act];
				let transPreMarking = trans.getPreMarking();
				let transPostMarking = trans.getPostMarking();
				let enabled = marking.getEnabledTransitions();
				let newVisitedTransitions = [];
				for (let trans of visitedTransitions) {
					newVisitedTransitions.push(trans);
				}
				if (!(enabled.includes(trans))) {
					let internalMarking = marking.copy();
					let internalConsumed = consumed;
					let internalProduced = produced;
					let internalConsumedPerPlace = {};
					let internalProducedPerPlace = {};
					Object.assign(internalConsumedPerPlace, consumedPerPlace);
					Object.assign(internalProducedPerPlace, producedPerPlace);
					while (!(enabled.includes(trans))) {
						let transList = TokenBasedReplay.enableTransThroughInvisibles(internalMarking, transPreMarking, invisibleChain);
						if (transList == null) {
							break;
						}
						else {
							for (let internalTrans of transList) {
								let internalTransPreMarking = internalTrans.getPreMarking();
								let internalTransPostMarking = internalTrans.getPostMarking();
								let internalEnabledTrans = internalMarking.getEnabledTransitions();
								if (internalEnabledTrans.includes(internalTrans)) {
									newVisitedTransitions.push(internalTrans);
									internalMarking = internalMarking.execute(internalTrans);
									// counts consumed and produced tokens
									for (let place in internalTransPreMarking) {
										internalConsumed += internalTransPreMarking[place];
										internalConsumedPerPlace[place] += internalTransPreMarking[place];
									}
									for (let place in internalTransPostMarking) {
										internalProduced += internalTransPostMarking[place];
										internalProducedPerPlace[place] += internalTransPostMarking[place];
									}
								}
								else {
									transList = null;
									break;
								}
							}
							if (transList == null) {
								break;
							}
							enabled = internalMarking.getEnabledTransitions();
						}
					}
					if (enabled.includes(trans)) {
						marking = internalMarking;
						consumed = internalConsumed;
						produced = internalProduced;
						visitedTransitions = newVisitedTransitions;
						consumedPerPlace = internalConsumedPerPlace;
						producedPerPlace = internalProducedPerPlace;
					}
				}
				if (!(enabled.includes(trans))) {
					// inserts missing tokens
					for (let place in transPreMarking) {
						let diff = transPreMarking[place];
						if (place in marking.tokens) {
							diff -= marking.tokens[place];
						}
						marking.tokens[place] = diff;
						missing += diff;
						missingPerPlace[place] += diff;
					}
				}
				// counts consumed and produced tokens
				for (let place in transPreMarking) {
					consumed += transPreMarking[place];
					consumedPerPlace[place] += transPreMarking[place];
				}
				for (let place in transPostMarking) {
					produced += transPostMarking[place];
					producedPerPlace[place] += transPostMarking[place];
				}
				marking = marking.execute(trans);
				visitedMarkings.push(marking);
				visitedTransitions.push(trans);
			}
			else if (!(act in missingActivitiesInModel)) {
				missingActivitiesInModel.push(act);
			}
		}
		if (reachFm) {
			if (!(acceptingPetriNet.fm.equals(marking))) {
				let internalMarking = marking.copy();
				let internalConsumed = consumed;
				let internalProduced = produced;
				let internalConsumedPerPlace = {};
				let internalProducedPerPlace = {};
				Object.assign(internalConsumedPerPlace, consumedPerPlace);
				Object.assign(internalProducedPerPlace, producedPerPlace);
				let newVisitedTransitions = [];
				for (let trans of visitedTransitions) {
					newVisitedTransitions.push(trans);
				}
				while (!(acceptingPetriNet.fm.equals(internalMarking))) {
					let transList = TokenBasedReplay.reachFmThroughInvisibles(internalMarking, acceptingPetriNet.fm, invisibleChain);
					if (transList == null) {
						break;
					}
					else {
						for (let internalTrans of transList) {
							let internalTransPreMarking = internalTrans.getPreMarking();
							let internalTransPostMarking = internalTrans.getPostMarking();
							let internalEnabledTrans = internalMarking.getEnabledTransitions();
							if (internalEnabledTrans.includes(internalTrans)) {
								newVisitedTransitions.push(internalTrans);
								internalMarking = internalMarking.execute(internalTrans);
								// counts consumed and produced tokens
								for (let place in internalTransPreMarking) {
									internalConsumed += internalTransPreMarking[place];
									internalConsumedPerPlace[place] += internalTransPreMarking[place];
								}
								for (let place in internalTransPostMarking) {
									internalProduced += internalTransPostMarking[place];
									internalProducedPerPlace[place] += internalTransPostMarking[place];
								}
							}
							else {
								transList = null;
								break;
							}
						}
						if (transList == null) {
							break;
						}
					}
				}
				if (acceptingPetriNet.fm.equals(internalMarking)) {
					marking = internalMarking;
					consumed = internalConsumed;
					produced = internalProduced;
					visitedTransitions = newVisitedTransitions;
					consumedPerPlace = internalConsumedPerPlace;
					producedPerPlace = internalProducedPerPlace;
				}
			}
			for (let place in acceptingPetriNet.fm.tokens) {
				if (!(place in marking.tokens)) {
					missing += acceptingPetriNet.fm.tokens[place];
					missingPerPlace[place] += acceptingPetriNet.fm.tokens[place];
				}
				else if (marking.tokens[place] < acceptingPetriNet.fm.tokens[place]) {
					missing += acceptingPetriNet.fm.tokens[place] - marking.tokens[place];
					missingPerPlace[place] += acceptingPetriNet.fm.tokens[place] - marking.tokens[place];
				}
			}
			for (let place in marking.tokens) {
				if (!(place in acceptingPetriNet.fm.tokens)) {
					remaining += marking.tokens[place];
					remainingPerPlace[place] += marking.tokens[place];
				}
				else if (marking.tokens[place] > acceptingPetriNet.fm.tokens[place]) {
					remaining += marking.tokens[place] - acceptingPetriNet.fm.tokens[place];
					remainingPerPlace[place] += marking.tokens[place] - acceptingPetriNet.fm.tokens[place];
				}
			}
		}
		let fitMC = 0.0;
		let fitRP = 0.0;
		if (consumed > 0) {
			fitMC = 1.0 - missing / consumed;
		}
		if (produced > 0) {
			fitRP = 1.0 - remaining / produced;
		}
		let fitness = 0.5*fitMC + 0.5*fitRP;
		let isFit = (Object.keys(missingActivitiesInModel).length == 0) && (missing == 0);
		return {"consumed": consumed, "produced": produced, "missing": missing, "remaining": remaining, "visitedTransitions": visitedTransitions, "visitedMarkings": visitedMarkings, "missingActivitiesInModel": missingActivitiesInModel, "fitness": fitness, "isFit": isFit, "reachedMarking": marking, "consumedPerPlace": consumedPerPlace, "producedPerPlace": producedPerPlace, "missingPerPlace": missingPerPlace, "remainingPerPlace": remainingPerPlace};
	}
	
	static enableTransThroughInvisibles(marking, transPreMarking, invisibleChain) {
		let diff1 = [];
		let diff2 = [];
		for (let place in marking.tokens) {
			if (!(place in transPreMarking)) {
				diff1.push(place);
			}
		}
		for (let place in transPreMarking) {
			if ((!(place in marking.tokens)) || marking.tokens[place] < transPreMarking[place]) {
				diff2.push(place);
			}
		}
		for (let place of diff1) {
			if (place in invisibleChain) {
				for (let place2 of diff2) {
					if (place2 in invisibleChain[place]) {
						return invisibleChain[place][place2];
					}
				}
			}
		}
		return null;
	}
	
	static reachFmThroughInvisibles(marking, finalMarking, invisibleChain) {
		let diff1 = [];
		let diff2 = [];
		for (let place in marking.tokens) {
			if (!(place in finalMarking.tokens)) {
				diff1.push(place);
			}
		}
		for (let place in finalMarking.tokens) {
			if ((!(place in marking.tokens)) || marking.tokens[place] < finalMarking.tokens[place]) {
				diff2.push(place);
			}
		}
		for (let place of diff1) {
			if (place in invisibleChain) {
				for (let place2 of diff2) {
					if (place2 in invisibleChain[place]) {
						return invisibleChain[place][place2];
					}
				}
			}
		}
		return null;
	}
	
	static getArrActivities(trace, activityKey) {
		let ret = [];
		for (let eve of trace.events) {
			ret.push(eve.attributes[activityKey].value);
		}
		return ret;
	}
	
	static buildInvisibleChain(net) {
		let initialDictio = TokenBasedReplay.buildInvisibleChainInitial(net);
		let changedPlaces = Object.keys(initialDictio);
		let invisibleChain = {};
		Object.assign(invisibleChain, initialDictio);
		while (changedPlaces.length > 0) {
			let newChanges = [];
			for (let place in invisibleChain) {
				for (let place2 in invisibleChain[place]) {
					if (changedPlaces.includes(place2)) {
						if (place2 in invisibleChain) {
							for (let place3 in invisibleChain[place2]) {
								if (!(place3 in invisibleChain[place])) {
									invisibleChain[place][place3] = [ ...invisibleChain[place][place2], ...invisibleChain[place2][place3] ];
									newChanges.push(place);
								}
							}
						}
					}
				}
			}
			changedPlaces = newChanges;
		}
		return invisibleChain;
	}
	
	static buildInvisibleChainInitial(net) {
		let initialDictio = {};
		for (let placeId in net.places) {
			let place = net.places[placeId];
			initialDictio[place] = {};
			for (let arcId in place.outArcs) {
				let trans = place.outArcs[arcId].target;
				if (trans.label == null) {
					for (let arcId2 in trans.outArcs) {
						let place2 = trans.outArcs[arcId2].target;
						initialDictio[place][place2] = [trans];
					}
				}
			}
			if (Object.keys(initialDictio[place]).length == 0) {
				delete initialDictio[place];
			}
		}
		return initialDictio;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {TokenBasedReplay: TokenBasedReplay};
	global.TokenBasedReplay = TokenBasedReplay
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerAlgorithm("TokenBasedReplay", "apply", ["EventLog", "AcceptingPetriNet"], "TokenBasedReplayResult", "Perform Token Based Replay", "Alessandro Berti");


class GeneralizationTbrResults {
	constructor(value) {
		this.value = value;
	}
}

class GeneralizationTbr {
	static apply(tbrResults) {
		let invSqOccSum = 0.0
		for (let trans in tbrResults.transExecutions) {
			let thisTerm = 1.0 / Math.sqrt(Math.max(tbrResults.transExecutions[trans], 1));
			invSqOccSum += thisTerm;
		}
		let ret = new GeneralizationTbrResults(1.0 - invSqOccSum/(Object.keys(tbrResults.transExecutions).length));
		Pm4JS.registerObject(ret, "Generalization Results");
		return ret;
	}
}

try {
	require("../../../pm4js.js");
	require("../../conformance/tokenreplay/algorithm.js");
	module.exports = {GeneralizationTbr: GeneralizationTbr, GeneralizationTbrResults: GeneralizationTbrResults};
	global.GeneralizationTbr = GeneralizationTbr;
	global.GeneralizationTbrResults = GeneralizationTbrResults;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerAlgorithm("GeneralizationTbr", "apply", ["TokenBasedReplayResult"], "GeneralizationTbrResults", "Calculate Generalization", "Alessandro Berti");


class SimplicityArcDegreeResults {
	constructor(value) {
		this.value = value;
	}
}

class SimplicityArcDegree {
	static apply(acceptingPetriNet, k=0) {
		let summ = 0.0;
		let count = 0;
		for (let placeId in acceptingPetriNet.net.places) {
			let place = acceptingPetriNet.net.places[placeId];
			summ += Object.keys(place.inArcs).length;
			summ += Object.keys(place.outArcs).length;
			count += 2;
		}
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			summ += Object.keys(trans.inArcs).length;
			summ += Object.keys(trans.outArcs).length;
			count += 2;
		}
		let meanDegree = 0;
		if (count > 0) {
			meanDegree = summ / count;
		}
		let simplicity = 1.0 / (1.0 + Math.max(meanDegree - k, 0));
		let ret = new SimplicityArcDegreeResults(simplicity);
		Pm4JS.registerObject(ret, "Simplicity Results");
		return ret;
	}
}

try {
	require("../../../pm4js.js");
	require("../../../objects/petri_net/petri_net.js");
	module.exports = {SimplicityArcDegree: SimplicityArcDegree, SimplicityArcDegreeResults: SimplicityArcDegreeResults};
	global.SimplicityArcDegree = SimplicityArcDegree;
	global.SimplicityArcDegreeResults = SimplicityArcDegreeResults;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerAlgorithm("SimplicityArcDegree", "apply", ["AcceptingPetriNet"], "SimplicityArcDegreeResults", "Calculate Simplicity (Arc Degree)", "Alessandro Berti");


class FrequencyDfg {
	constructor(activities, startActivities, endActivities, pathsFrequency) {
		this.activities = activities;
		this.startActivities = startActivities;
		this.endActivities = endActivities;
		this.pathsFrequency = pathsFrequency;
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {FrequencyDfg: FrequencyDfg};
	global.FrequencyDfg = FrequencyDfg;
}
catch (err) {
	// not in Node
}


class PerformanceDfg {
	constructor(activities, startActivities, endActivities, pathsFrequency, pathsPerformance, sojournTimes) {
		this.activities = activities;
		this.startActivities = startActivities;
		this.endActivities = endActivities;
		this.pathsFrequency = pathsFrequency;
		this.pathsPerformance = pathsPerformance;
		this.sojournTimes = sojournTimes;
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {PerformanceDfg: PerformanceDfg};
	global.PerformanceDfg = PerformanceDfg;
}
catch (err) {
	// not in Node
}


class FrequencyDfgDiscovery {
	static applyPlugin(eventLog, activityKey="concept:name") {
		return FrequencyDfgDiscovery.apply(eventLog, activityKey, true);
	}
	
	static apply(eventLog, activityKey="concept:name", addObject=false) {
		let sa = GeneralLogStatistics.getStartActivities(eventLog, activityKey);
		let ea = GeneralLogStatistics.getEndActivities(eventLog, activityKey);
		let activities = GeneralLogStatistics.getAttributeValues(eventLog, activityKey);
		let paths = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length-1) {
				let act1 = trace.events[i].attributes[activityKey].value;
				let act2 = trace.events[i+1].attributes[activityKey].value;
				let path = act1+","+act2;
				let pathOcc = paths[path];
				if (pathOcc == null) {
					paths[path] = 1;
				}
				else {
					paths[path] = paths[path] + 1;
				}
				i++;
			}
		}
		let ret = new FrequencyDfg(activities, sa, ea, paths);
		if (addObject) {
			Pm4JS.registerObject(ret, "Frequency Directly-Follows Graph");
		}
		return ret;
	}
}

class PerformanceDfgDiscovery {
	static applyPlugin(eventLog, activityKey="concept:name", timestampKey="time:timestamp", aggregationMeasure="mean", startTimestampKey="time:timestamp") {
		return PerformanceDfgDiscovery.apply(eventLog, activityKey, timestampKey, aggregationMeasure, startTimestampKey, true);
	}
	
	static apply(eventLog, activityKey="concept:name", timestampKey="time:timestamp", aggregationMeasure="mean", startTimestampKey="time:timestamp", addObject=false) {
		let freqDfg = FrequencyDfgDiscovery.apply(eventLog, activityKey);
		let sa = freqDfg.startActivities;
		let ea = freqDfg.endActivities;
		let activities = freqDfg.activities;
		let pathsFrequency = freqDfg.pathsFrequency;
		let paths = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length-1) {
				let act1 = trace.events[i].attributes[activityKey].value;
				let act2 = trace.events[i+1].attributes[activityKey].value;
				let path = act1+","+act2;
				let ts1 = trace.events[i].attributes[timestampKey].value.getTime();
				let ts2 = trace.events[i+1].attributes[startTimestampKey].value.getTime();
				let diff = (ts2 - ts1)/1000;
				if (!(path in paths)) {
					paths[path] = [];
				}
				paths[path].push(diff);
				i++;
			}
		}
		for (let path in paths) {
			if (aggregationMeasure == "stdev") {
				paths[path] = PerformanceDfgDiscovery.calculateStdev(paths[path]);
			}
			else if (aggregationMeasure == "min") {
				paths[path] = PerformanceDfgDiscovery.calculateMin(paths[path]);
			}
			else if (aggregationMeasure == "max") {
				paths[path] = PerformanceDfgDiscovery.calculateMax(paths[path]);
			}
			else if (aggregationMeasure == "median") {
				paths[path] = PerformanceDfgDiscovery.calculateMedian(paths[path]);
			}
			else if (aggregationMeasure == "sum") {
				paths[path] = PerformanceDfgDiscovery.calculateSum(paths[path]);
			}
			else {
				paths[path] = PerformanceDfgDiscovery.calculateMean(paths[path]);
			}
		}
		let sojournTimes = GeneralLogStatistics.getAverageSojournTime(eventLog, activityKey, timestampKey, startTimestampKey);
		let ret = new PerformanceDfg(activities, sa, ea, pathsFrequency, paths, sojournTimes);
		if (addObject) {
			Pm4JS.registerObject(ret, "Performance Directly-Follows Graph");
		}
		return ret;
	}
	
	static calculateMean(array) {
		let sum = 0.0;
		for (let el of array) {
			sum += el;
		}
		return sum / array.length;
	}
	
	static calculateStdev(array) {
		let mean = PerformanceDfgDiscovery.calculateMean(array);
		let sum = 0.0;
		for (let el of array) {
			sum += (el - mean)*(el-mean);
		}
		return Math.sqrt(sum / array.length);
	}
	
	static calculateMin(array) {
		let minValue = Number.MAX_SAFE_INTEGER;
		for (let el of array) {
			minValue = Math.min(minValue, el);
		}
		return minValue;
	}
	
	static calculateMax(array) {
		let maxValue = Number.MIN_SAFE_INTEGER;
		for (let el of array) {
			maxValue = Math.max(maxValue, el);
		}
		return maxValue;
	}
	
	static calculateMedian(array) {
		array.sort();
		return array[Math.floor(array.length / 2)];
	}
	
	static calculateSum(array) {
		let ret = 0.0;
		for (let el of array) {
			ret += el;
		}
		return ret;
	}
}

try {
	require("../../../pm4js.js");
	require("../../../statistics/log/general.js");
	require("../../../objects/dfg/frequency/obj.js");
	require("../../../objects/dfg/performance/obj.js");
	module.exports = {FrequencyDfgDiscovery: FrequencyDfgDiscovery, PerformanceDfgDiscovery: PerformanceDfgDiscovery};
	global.FrequencyDfgDiscovery = FrequencyDfgDiscovery;
	global.PerformanceDfgDiscovery = PerformanceDfgDiscovery;
}
catch (err) {
	// not in Node.JS
}

Pm4JS.registerAlgorithm("FrequencyDfgDiscovery", "applyPlugin", ["EventLog"], "FrequencyDfg", "Get Frequency DFG abstraction", "Alessandro Berti");
Pm4JS.registerAlgorithm("PerformanceDfgDiscovery", "applyPlugin", ["EventLog"], "PerformanceDfg", "Get Performance DFG abstraction", "Alessandro Berti");


class InductiveMiner {
	static applyPlugin(eventLog, activityKey="concept:name", threshold=0.0, removeNoise=false) {
		return InductiveMiner.apply(eventLog, activityKey, threshold, removeNoise, true);
	}
	
	static apply(eventLog, activityKey="concept:name", threshold=0.0, removeNoise=false, addObject=false) {
		let tree = InductiveMiner.inductiveMiner(eventLog, null, activityKey, removeNoise, threshold);
		if (addObject) {
			Pm4JS.registerObject(tree, "Process Tree (Inductive Miner)");
		}
		return tree;
	}
	
	static keepOneTracePerVariant(log, activityKey) {
		let newEventLog = new EventLog();
		let variants = GeneralLogStatistics.getVariants(log, activityKey);
		for (let vari in variants) {
			let activ = vari.split(",");
			let newTrace = new Trace();
			for (let act of activ) {
				if (act.length > 0) {
					let newEvent = new Event();
					newEvent.attributes[activityKey] = new Attribute(act);
					newTrace.events.push(newEvent);
				}
			}
			newEventLog.traces.push(newTrace);
		}
		return newEventLog;
	}
		
	static inductiveMiner(log, treeParent, activityKey, removeNoise, threshold) {
		if (threshold == 0) {
			log = InductiveMiner.keepOneTracePerVariant(log, activityKey);
		}
		let freqDfg = FrequencyDfgDiscovery.apply(log, activityKey);
		if (threshold > 0 && removeNoise) {
			freqDfg = InductiveMiner.removeNoiseFromDfg(freqDfg, threshold);
		}
		let emptyTraces = InductiveMiner.countEmptyTraces(log);
		if (emptyTraces > threshold * log.traces.length) {
			let xor = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			let skip = new ProcessTree(xor, null, null);
			xor.children.push(InductiveMiner.inductiveMiner(InductiveMiner.filterNonEmptyTraces(log), xor, activityKey, false, threshold));
			xor.children.push(skip);
			return xor;
		}
		if (Object.keys(freqDfg.pathsFrequency).length == 0) {
			return InductiveMiner.baseCase(freqDfg, treeParent);
		}
		let detectedCut = InductiveMiner.detectCut(log, freqDfg, treeParent, activityKey, threshold);
		if (detectedCut != null) {
			return detectedCut;
		}
		if (!(removeNoise)) {
			let detectedFallthrough = InductiveMiner.detectFallthroughs(log, freqDfg, treeParent, activityKey, threshold);
			if (detectedFallthrough != null) {
				return detectedFallthrough;
			}
		}
		if (!(removeNoise) && threshold > 0) {
			return InductiveMiner.inductiveMiner(log, treeParent, activityKey, true, threshold);
		}
		return InductiveMiner.mineFlower(freqDfg, treeParent);
	}
	
	static removeNoiseFromDfg(freqDfg, threshold) {
		let maxPerActivity = {};
		for (let ea in freqDfg.endActivities) {
			maxPerActivity[ea] = freqDfg.endActivities[ea];
		}
		for (let path in freqDfg.pathsFrequency) {
			let pf = freqDfg.pathsFrequency[path];
			let act1 = path.split(",")[0];
			if (!(act1 in maxPerActivity)) {
				maxPerActivity[act1] = pf;
			}
			else {
				maxPerActivity[act1] = Math.max(pf, maxPerActivity[act1]);
			}
		}
		for (let path in freqDfg.pathsFrequency) {
			let pf = freqDfg.pathsFrequency[path];
			let act1 = path.split(",")[0];
			if (pf < (1 - threshold)*maxPerActivity[act1]) {
				delete freqDfg.pathsFrequency[path];
			}
		}
		return freqDfg;
	}
	
	static detectCut(log, freqDfg, treeParent, activityKey, threshold) {
		if (freqDfg == null) {
			freqDfg = FrequencyDfgDiscovery.apply(log, activityKey);
		}
		let seqCut = InductiveMinerSequenceCutDetector.detect(log, freqDfg, activityKey);
		if (seqCut != null) {
			//console.log("InductiveMinerSequenceCutDetector");
			let logs = InductiveMinerSequenceCutDetector.project(log, seqCut, activityKey);
			let seqNode = new ProcessTree(treeParent, ProcessTreeOperator.SEQUENCE, null);
			for (let sublog of logs) {
				let child = InductiveMiner.inductiveMiner(sublog, seqNode, activityKey, false, threshold);
				seqNode.children.push(child);
			}
			return seqNode;
		}
		let xorCut = InductiveMinerExclusiveCutDetector.detect(log, freqDfg, activityKey);
		if (xorCut != null) {
			//console.log("InductiveMinerExclusiveCutDetector");
			let logs = InductiveMinerExclusiveCutDetector.project(log, xorCut, activityKey);
			let xorNode = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			for (let sublog of logs) {
				let child = InductiveMiner.inductiveMiner(sublog, xorNode, activityKey, false, threshold);
				xorNode.children.push(child);
			}
			return xorNode;
		}
		let andCut = InductiveMinerParallelCutDetector.detect(log, freqDfg, activityKey);
		if (andCut != null) {
			//console.log("InductiveMinerParallelCutDetector");
			let logs = InductiveMinerParallelCutDetector.project(log, andCut, activityKey);
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			for (let sublog of logs) {
				let child = InductiveMiner.inductiveMiner(sublog, parNode, activityKey, false, threshold);
				parNode.children.push(child);
			}
			return parNode;
		}
		let loopCut = InductiveMinerLoopCutDetector.detect(log, freqDfg, activityKey);
		if (loopCut != null) {
			//console.log("InductiveMinerLoopCutDetector");
			let logs = InductiveMinerLoopCutDetector.project(log, loopCut, activityKey);
			let loopNode = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			loopNode.children.push(InductiveMiner.inductiveMiner(logs[0], loopNode, activityKey, false, threshold));
			loopNode.children.push(InductiveMiner.inductiveMiner(logs[1], loopNode, activityKey, false, threshold));
			return loopNode;
		}
		return null;
	}
	
	static detectFallthroughs(log, freqDfg, treeParent, activityKey, threshold) {
		let activityOncePerTraceCandidate = InductiveMinerActivityOncePerTraceFallthrough.detect(log, freqDfg, activityKey);
		if (activityOncePerTraceCandidate != null) {
			//console.log("InductiveMinerActivityOncePerTraceFallthrough");
			let sublog = InductiveMinerActivityOncePerTraceFallthrough.project(log, activityOncePerTraceCandidate, activityKey);
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			let actNode = new ProcessTree(parNode, null, activityOncePerTraceCandidate);
			parNode.children.push(actNode);
			parNode.children.push(InductiveMiner.inductiveMiner(sublog, parNode, activityKey, false, threshold));
			return parNode;
		}
		let activityConcurrentCut = InductiveMinerActivityConcurrentFallthrough.detect(log, freqDfg, activityKey, threshold);
		if (activityConcurrentCut != null) {
			//console.log("InductiveMinerActivityConcurrentFallthrough");
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			let filteredLog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [activityConcurrentCut[0]], true, true, activityKey);
			parNode.children.push(InductiveMiner.inductiveMiner(filteredLog, parNode, activityKey, false, threshold));
			activityConcurrentCut[1].parentNode = parNode;
			parNode.children.push(activityConcurrentCut[1]);
			return parNode;
		}
		let strictTauLoop = InductiveMinerStrictTauLoopFallthrough.detect(log, freqDfg, activityKey);
		if (strictTauLoop != null) {
			//console.log("InductiveMinerStrictTauLoopFallthrough");
			let loop = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			let redo = new ProcessTree(loop, null, null);
			loop.children.push(InductiveMiner.inductiveMiner(strictTauLoop, loop, activityKey, false, threshold));
			loop.children.push(redo);
			return loop;
		}
		let tauLoop = InductiveMinerTauLoopFallthrough.detect(log, freqDfg, activityKey);
		if (tauLoop != null) {
			//console.log("InductiveMinerTauLoopFallthrough");
			let loop = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			let redo = new ProcessTree(loop, null, null);
			loop.children.push(InductiveMiner.inductiveMiner(tauLoop, loop, activityKey, false, threshold));
			loop.children.push(redo);
			return loop;
		}
		return null;
	}
	
	static mineFlower(freqDfg, treeParent) {
		let loop = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
		let xor = new ProcessTree(loop, ProcessTreeOperator.EXCLUSIVE, null);
		let redo = new ProcessTree(loop, null, null);
		loop.children.push(xor);
		loop.children.push(redo);
		for (let act in freqDfg.activities) {
			let actNode = new ProcessTree(xor, null, act);
			xor.children.push(actNode);
		}
		return loop;
	}
	
	static baseCase(freqDfg, treeParent) {
		if (Object.keys(freqDfg.activities).length == 0) {
			return new ProcessTree(treeParent, null, null);
		}
		else if (Object.keys(freqDfg.activities).length == 1) {
			let activities = Object.keys(freqDfg.activities);
			return new ProcessTree(treeParent, null, activities[0]);
		}
		else {
			let xor = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			for (let act in freqDfg.activities) {
				let actNode = new ProcessTree(xor, null, act);
				xor.children.push(actNode);
			}
			return xor;
		}
	}
	
	static countEmptyTraces(eventLog) {
		let ret = 0;
		for (let trace of eventLog.traces) {
			if (trace.events.length == 0) {
				ret++;
			}
		}
		return ret;
	}
	
	static filterNonEmptyTraces(eventLog) {
		let filteredLog = new EventLog();
		for (let trace of eventLog.traces) {
			if (trace.events.length > 0) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
}

class InductiveMinerSequenceCutDetector {
    // Basic Steps:
    // 1. create a group per activity
    // 2. merge pairwise reachable nodes (based on transitive relations)
    // 3. merge pairwise unreachable nodes (based on transitive relations)
    // 4. sort the groups based on their reachability
	static detect(log, freqDfg, activityKey) {
		let actReach = InductiveMinerGeneralUtilities.activityReachability(freqDfg);
		let groups = [];
		for (let act in actReach) {
			groups.push([act]);
		}
		let groupsSize = null;
		while (groupsSize != groups.length) {
			groupsSize = groups.length;
			groups = InductiveMinerSequenceCutDetector.mergeGroups(groups, actReach);
		}
		groups = InductiveMinerSequenceCutDetector.sortBasedOnReachability(groups, actReach);
		if (groups.length > 1) {
			return groups;
		}
		return null;
	}
	
	static mergeGroups(groups, actReach) {
		let i = 0;
		while (i < groups.length) {
			let j = i + 1;
			while (j < groups.length) {
				if (InductiveMinerSequenceCutDetector.checkMergeCondition(groups[i], groups[j], actReach)) {
					groups[i] = [...groups[i], ...groups[j]];
					groups.splice(j, 1);
					continue;
				}
				j++;
			}
			i++;
		}
		return groups;
	}
	
	static checkMergeCondition(g1, g2, actReach) {
		for (let a1 of g1) {
			for (let a2 of g2) {
				if ((a2 in actReach[a1] && a1 in actReach[a2]) || (!(a2 in actReach[a1]) && !(a1 in actReach[a2]))) {
					return true;
				}
			}
		}
		return false;
	}
	
	static sortBasedOnReachability(groups, actReach) {
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < groups.length) {
				let j = i + 1;
				while (j < groups.length) {
					for (let act1 of groups[i]) {
						for (let act2 of groups[j]) {
							if (act1 in actReach[act2]) {
								let temp = groups[i];
								groups[i] = groups[j];
								groups[j] = temp;
								cont = true;
								break;
							}
						}
						if (cont) {
							break;
						}
					}
					if (cont) {
						break;
					}
					j++;
				}
				if (cont) {
					break;
				}
				i++;
			}
		}
		return groups;
	}
	
	static project(log, groups, activityKey) {
		let logs = [];
		for (let g of groups) {
			logs.push(new EventLog());
		}
		for (let trace of log.traces) {
			let i = 0;
			let splitPoint = 0;
			let actUnion = [];
			while (i < groups.length) {
				let newSplitPoint = InductiveMinerSequenceCutDetector.findSplitPoint(trace, groups[i], splitPoint, actUnion, activityKey);
				let tracei = new Trace();
				let j = splitPoint;
				while (j < newSplitPoint) {
					if (groups[i].includes(trace.events[j].attributes[activityKey].value)) {
						tracei.events.push(trace.events[j]);
					}
					j++;
				}
				logs[i].traces.push(tracei);
				splitPoint = newSplitPoint;
				for (let act of groups[i]) {
					actUnion.push(act);
				}
				i++;
			}
		}
		return logs;
	}
	
	static findSplitPoint(trace, group, start, ignore, activityKey) {
		let leastCost = 0
		let positionWithLeastCost = start;
		let cost = 0;
		let i = start;
		while (i < trace.events.length) {
			if (group.includes(trace.events[i].attributes[activityKey].value)) {
				cost = cost - 1
			}
			else if (!(ignore.includes(trace.events[i].attributes[activityKey].value))) {
				cost = cost + 1
			}
			if (cost < leastCost) {
				leastCost = cost;
				positionWithLeastCost = i + 1;
			}
			i++;
		}
		return positionWithLeastCost;
	}
}

class InductiveMinerLoopCutDetector {
	// 1. merge all start and end activities in one group ('do' group)
    // 2. remove start/end activities from the dfg
    // 3. detect connected components in (undirected representative) of the reduced graph
    // 4. check if each component meets the start/end criteria of the loop cut definition (merge with the 'do' group if not)
    // 5. return the cut if at least two groups remain
	static detect(log, freqDfg0, activityKey) {
		let freqDfg = Object();
		freqDfg.pathsFrequency = {};
		for (let path in freqDfg0.pathsFrequency) {
			let act1 = path.split(",")[0];
			let act2 = path.split(",")[1];
			if (!(act1 in freqDfg0.startActivities || act2 in freqDfg0.startActivities || act1 in freqDfg0.endActivities || act2 in freqDfg0.endActivities)) {
				freqDfg.pathsFrequency[path] = freqDfg0.pathsFrequency[path];
			}
		}
		let doPart = [];
		let redoPart = [];
		let remainingActivities = {};
		for (let act in freqDfg0.activities) {
			if (act in freqDfg0.startActivities || act in freqDfg0.endActivities) {
				doPart.push(act);
			}
			else {
				remainingActivities[act] = freqDfg0.activities[act];
			}
		}
		freqDfg.activities = remainingActivities;
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		for (let conn of connComp) {
			let isRedo = true;
			for (let act of conn) {
				for (let sa in freqDfg0.startActivities) {
					if (!([act, sa] in freqDfg0.pathsFrequency)) {
						isRedo = false;
						break;
					}
				}
				/*for (let ea in freqDfg0.endActivities) {
					if (!([ea, act] in freqDfg0.pathsFrequency)) {
						isRedo = false;
						break;
					}
				}*/
			}
			for (let act of conn) {
				if (isRedo) {
					redoPart.push(act);
				}
				else {
					doPart.push(act);
				}
			}
		}
		if (redoPart.length > 0) {
			return [doPart, redoPart];
		}
		return null;
	}
	
	static project(log, groups, activityKey) {
		let sublogs = [new EventLog(), new EventLog()];
		for (let trace of log.traces) {
			let i = 0;
			let j = 0;
			let subtraceDo = new Trace();
			let subtraceRedo = new Trace();
			while (i < trace.events.length) {
				let thisAct = trace.events[i].attributes[activityKey].value;
				if (groups[0].includes(thisAct)) {
					if (j == 1) {
						sublogs[1].traces.push(subtraceRedo);
						subtraceRedo = new Trace();
					}
					j = 0;
					
				}
				else if (groups[1].includes(thisAct)) {
					if (j == 0) {
						sublogs[0].traces.push(subtraceDo);
						subtraceDo = new Trace();
					}
					j = 1;
				}
				else {
					i++;
					continue;
				}
				if (j == 0) {
					subtraceDo.events.push(trace.events[i]);
				}
				else {
					subtraceRedo.events.push(trace.events[i]);
				}
				i++;
			}
			if (j == 0) {
				sublogs[0].traces.push(subtraceDo);
			}
		}
		return sublogs;
	}
}

class InductiveMinerParallelCutDetector {
	static detect(log, freqDfg, activityKey) {
		let ret = [];
		for (let act in freqDfg.activities) {
			ret.push([act]);
		}
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < ret.length) {
				let j = i + 1;
				while (j < ret.length) {
					for (let act1 of ret[i]) {
						if (ret[j] != null) {
							for (let act2 of ret[j]) {
								if ((!([act1, act2] in freqDfg.pathsFrequency)) || (!([act2, act1] in freqDfg.pathsFrequency))) {
									ret[i] = [...ret[i], ...ret[j]];
									ret.splice(j, 1);
									cont = true;
									break;
								}
							}
							if (cont) {
								break;
							}
						}
					}
					if (cont) {
						break;
					}
					j++;
				}
				if (cont) {
					break;
				}
				i++;
			}
		}
		ret.sort(function(a, b) {
			if (a.length < b.length) {
				return -1;
			}
			else if (a.length > b.length) {
				return 1;
			}
			return 0;
		});
		if (ret.length > 1) {
			let i = 0;
			while (i < ret.length) {
				let containsSa = false;
				let containsEa = false;
				for (let sa in freqDfg.startActivities) {
					if (ret[i].includes(sa)) {
						containsSa = true;
						break;
					}
				}
				for (let ea in freqDfg.endActivities) {
					if (ret[i].includes(ea)) {
						containsEa = true;
						break;
					}
				}
				if (!(containsSa && containsEa)) {
					let targetIdx = i-1;
					if (targetIdx < 0) {
						targetIdx = i+1;
					}
					if (targetIdx < ret.length) {
						ret[targetIdx] = [...ret[targetIdx], ...ret[i]];
					}
					ret.splice(i, 1);
					continue;
				}
				i++;
			}
			if (ret.length > 1) {
				return ret;
			}
		}
		return null;
	}
	
	static project(log, groups, activityKey) {
		let ret = [];
		for (let g of groups) {
			ret.push(LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, g, true, true, activityKey));
		}
		return ret;
	}
}

class InductiveMinerExclusiveCutDetector {
	static detect(log, freqDfg, activityKey) {
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		if (connComp.length > 1) {
			return connComp;
		}
		return null;
	}
	
	static project(log, groups, activityKey) {
		let ret = [];
		for (let g of groups) {
			ret.push(new EventLog());
		}
		for (let trace of log.traces) {
			let gc = {};
			let i = 0;
			while (i < groups.length) {
				gc[i] = 0;
				i++;
			}
			let activ = [];
			for (let eve of trace.events) {
				activ.push(eve.attributes[activityKey].value);
			}
			let maxv = -1;
			let maxi = 0;
			i = 0;
			while (i < groups.length) {
				for (let act of groups[i]) {
					if (activ.includes(act)) {
						gc[i]++;
						if (gc[i] > maxv) {
							maxv = gc[i];
							maxi = i;
						}
					}
				}
				i++;
			}
			let projectedTrace = new Trace();
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey].value;
				if (groups[maxi].includes(act)) {
					projectedTrace.events.push(eve);
				}
			}
			ret[maxi].traces.push(projectedTrace);
		}
		return ret;
	}
}

class InductiveMinerActivityOncePerTraceFallthrough {
	static detect(log, freqDfg, activityKey) {
		if (Object.keys(freqDfg.activities).length > 1) {
			let inte = null;
			for (let trace of log.traces) {
				let activities = {};
				for (let eve of trace.events) {
					let act = eve.attributes[activityKey].value;
					if (!(act in activities)) {
						activities[act] = 1;
					}
					else {
						activities[act] += 1;
					}
				}
				if (inte != null) {
					for (let act in activities) {
						if (!(act in inte) || activities[act] > 1) {
							delete activities[act];
						}
					}
				}
				inte = activities;
			}
			if (inte != null) {
				inte = Object.keys(inte);
				if (inte.length > 0) {
					return inte[0];
				}
			}
		}
		return null;
	}
	
	static project(log, act, activityKey) {
		return LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [act], true, false, activityKey);
	}
}

class InductiveMinerActivityConcurrentFallthrough {
	static detect(log, freqDfg, activityKey, threshold) {
		if (Object.keys(freqDfg.activities).length > 1) {
			for (let act in freqDfg.activities) {
				let sublog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [act], true, false, activityKey);
				let detectedCut = InductiveMiner.detectCut(sublog, null, null, activityKey, threshold);
				if (detectedCut != null) {
					return [act, detectedCut];
				}
			}
		}
		return null;
	}
	
	static project(log, act, activityKey) {
		return LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [act], true, false, activityKey);
	}
}

class InductiveMinerStrictTauLoopFallthrough {
	static detect(log, freqDfg, activityKey) {
		let proj = new EventLog();
		for (let trace of log.traces) {
			let x = 0;
			let i = 1;
			while (i < trace.events.length) {
				let act_curr = trace.events[i].attributes[activityKey].value;
				let act_prev = trace.events[i-1].attributes[activityKey].value;
				if (act_curr in freqDfg.startActivities && act_prev in freqDfg.endActivities) {
					let subtrace = new Trace();
					let j = x;
					while (j < i) {
						subtrace.events.push(trace.events[j]);
						j++;
					}
					proj.traces.push(subtrace);
					x = i;
				}
				i++;
			}
			let j = x;
			let subtrace = new Trace();
			while (j < trace.events.length) {
				subtrace.events.push(trace.events[j]);
				j++;
			}
			proj.traces.push(subtrace);
		}
		if (proj.traces.length > log.traces.length) {
			return proj;
		}
		return null;
	}
}

class InductiveMinerTauLoopFallthrough {
	static detect(log, freqDfg, activityKey) {
		let proj = new EventLog();
		for (let trace of log.traces) {
			let x = 0;
			let i = 1;
			while (i < trace.events.length) {
				let act_curr = trace.events[i].attributes[activityKey].value;
				if (act_curr in freqDfg.startActivities) {
					let subtrace = new Trace();
					let j = x;
					while (j < i) {
						subtrace.events.push(trace.events[j]);
						j++;
					}
					proj.traces.push(subtrace);
					x = i;
				}
				i++;
			}
			let j = x;
			let subtrace = new Trace();
			while (j < trace.events.length) {
				subtrace.events.push(trace.events[j]);
				j++;
			}
			proj.traces.push(subtrace);
		}
		if (proj.traces.length > log.traces.length) {
			return proj;
		}
		return null;
	}
}

class InductiveMinerGeneralUtilities {
	static activityReachability(freqDfg) {
		let ret = {};
		for (let act in freqDfg.activities) {
			ret[act] = {};
		}
		for (let rel in freqDfg.pathsFrequency) {
			let act1 = rel.split(",")[0];
			let act2 = rel.split(",")[1];
			ret[act1][act2] = 0;
		}
		let cont = true;
		while (cont) {
			cont = false;
			for (let act in ret) {
				for (let act2 in ret[act]) {
					for (let act3 in ret[act2]) {
						if (!(act3 in ret[act])) {
							ret[act][act3] = 0;
							cont = true;
						}
					}
				}
			}
		}
		return ret;
	}
	
	static getConnectedComponents(freqDfg) {
		let ret = [];
		for (let act in freqDfg.activities) {
			ret.push([act]);
		}
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < ret.length) {
				let j = i + 1;
				while (j < ret.length) {
					for (let act1 of ret[i]) {
						if (ret[j] != null) {
							for (let act2 of ret[j]) {
								if ([act1, act2] in freqDfg.pathsFrequency || [act2, act1] in freqDfg.pathsFrequency) {
									ret[i] = [...ret[i], ...ret[j]];
									ret.splice(j, 1);
									cont = true;
									break;
								}
							}
							if (cont) {
								break;
							}
						}
					}
					if (cont) {
						break;
					}
					j++;
				}
				if (cont) {
					break;
				}
				i++;
			}
		}
		return ret;
	}
}

try {
	require('../../../pm4js.js');
	require('../../../objects/log/log.js');
	require('../../../objects/process_tree/process_tree.js');
	require('../../../objects/dfg/frequency/obj.js');
	require('../../../algo/discovery/dfg/algorithm.js');
	require('../../../statistics/log/general.js');
	module.exports = {InductiveMiner: InductiveMiner, InductiveMinerSequenceCutDetector: InductiveMinerSequenceCutDetector};
	global.InductiveMiner = InductiveMiner;
	global.InductiveMinerSequenceCutDetector = InductiveMinerSequenceCutDetector;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerAlgorithm("InductiveMiner", "applyPlugin", ["EventLog"], "ProcessTree", "Mine a Process Tree using the Inductive Miner", "Alessandro Berti");


class FrequencyDfgGraphvizVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = FrequencyDfgGraphvizVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(frequencyDfg) {
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		for (let act in frequencyDfg.activities) {
			let nUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
			uidMap[act] = nUid;
			ret.push(nUid+" [shape=box, label=\""+act+"\n"+frequencyDfg.activities[act]+"\"]");
		}
		let startNodeUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
		let endNodeUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
		ret.push(startNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=green]");
		ret.push(endNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=orange]");
		for (let sa in frequencyDfg.startActivities) {
			let occ = frequencyDfg.startActivities[sa];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(startNodeUid+" -> "+uidMap[sa]+" [label=\""+occ+"\", penwidth=\""+penwidth+"\"]");
		}
		for (let ea in frequencyDfg.endActivities) {
			let occ = frequencyDfg.endActivities[ea];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(uidMap[ea]+" -> "+endNodeUid+" [label=\""+occ+"\", penwidth=\""+penwidth+"\"]");
		}
		for (let arc in frequencyDfg.pathsFrequency) {
			let act1 = arc.split(",")[0];
			let act2 = arc.split(",")[1];
			let occ = frequencyDfg.pathsFrequency[arc];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(uidMap[act1]+" -> "+uidMap[act2]+" [label=\""+occ+"\", penwidth=\""+penwidth+"\"]");
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	require('../../objects/dfg/frequency/obj.js');
	module.exports = {FrequencyDfgGraphvizVisualizer: FrequencyDfgGraphvizVisualizer};
	global.FrequencyDfgGraphvizVisualizer = FrequencyDfgGraphvizVisualizer;
}
catch (err) {
	// not in node
}

class PerformanceDfgGraphvizVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = PerformanceDfgGraphvizVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(performanceDfg) {
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		for (let act in performanceDfg.activities) {
			let nUid = PerformanceDfgGraphvizVisualizer.nodeUuid();
			uidMap[act] = nUid;
			let st = performanceDfg.sojournTimes[act];
			ret.push(nUid+" [shape=box, label=\""+act+"\n("+humanizeDuration(st*1000)+")\"]");
		}
		let startNodeUid = PerformanceDfgGraphvizVisualizer.nodeUuid();
		let endNodeUid = PerformanceDfgGraphvizVisualizer.nodeUuid();
		ret.push(startNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=green]");
		ret.push(endNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=orange]");
		for (let sa in performanceDfg.startActivities) {
			ret.push(startNodeUid+" -> "+uidMap[sa]);
		}
		for (let ea in performanceDfg.endActivities) {
			ret.push(uidMap[ea]+" -> "+endNodeUid);
		}
		for (let arc in performanceDfg.pathsPerformance) {
			let act1 = arc.split(",")[0];
			let act2 = arc.split(",")[1];
			let perf = performanceDfg.pathsPerformance[arc];
			let penwidth = 0.5 + 0.3 * Math.log10(1 + perf);
			ret.push(uidMap[act1]+" -> "+uidMap[act2]+" [label=\""+humanizeDuration(Math.round(perf*1000))+"\", penwidth=\""+penwidth+"\"]");
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	require('../../objects/dfg/performance/obj.js');
	module.exports = {PerformanceDfgGraphvizVisualizer: PerformanceDfgGraphvizVisualizer};
	global.PerformanceDfgGraphvizVisualizer = PerformanceDfgGraphvizVisualizer;
}
catch (err) {
	// not in node
	console.log(err);
}

class PetriNetFrequencyVisualizer {
	static rgbColor(percent) {
		return [255 * percent, 255 * (1 - percent), 255 * (1 - percent)];
	}

	static hexFromRGB(r, g, b) {
		var hex = [
			Math.floor(r).toString( 16 ),
			Math.floor(g).toString( 16 ),
			Math.floor(b).toString( 16 )
		];
		let i = 0;
		while (i < hex.length) {
			if (hex[i].length == 1) {
				hex[i] = "0" + hex[i];
			}
			i++;
		}
		return "#" + hex.join( "" ).toLowerCase();
	}

	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = PetriNetFrequencyVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(acceptingPetriNet, tbrResult) {
		let petriNet = acceptingPetriNet.net;
		let im = acceptingPetriNet.im;
		let fm = acceptingPetriNet.fm;
		let ret = [];
		let uidMap = {};
		let transMaxFrequency = -1;
		let arcMaxFrequency = -1;
		for (let trans in tbrResult.transExecutions) {
			transMaxFrequency = Math.max(tbrResult.transExecutions[trans], transMaxFrequency);
		}
		for (let arc in tbrResult.arcExecutions) {
			arcMaxFrequency = Math.max(tbrResult.arcExecutions[arc], arcMaxFrequency);
		}
		ret.push("digraph G {");
		ret.push("rankdir=\"LR\"");
		for (let placeKey in petriNet.places) {
			let place = petriNet.places[placeKey];
			let nUid = PetriNetFrequencyVisualizer.nodeUuid();
			let fillColor = "white";
			if (place in im.tokens) {
				fillColor = "green";
			}
			else if (place in fm.tokens) {
				fillColor = "orange";
			}
			let placeLabel = "p="+tbrResult.totalProducedPerPlace[place]+";m="+tbrResult.totalMissingPerPlace[place]+"\nc="+tbrResult.totalConsumedPerPlace[place]+";r="+tbrResult.totalRemainingPerPlace[place];
			ret.push(nUid+" [shape=ellipse, label=\""+placeLabel+"\", style=filled, fillcolor="+fillColor+"]");
			uidMap[place] = nUid;
		}
		for (let transKey in petriNet.transitions) {
			let trans = petriNet.transitions[transKey];
			let perc = (1.0 - tbrResult.transExecutions[trans] / transMaxFrequency);
			let rgb = PetriNetFrequencyVisualizer.rgbColor(perc);
			let rgbHex = PetriNetFrequencyVisualizer.hexFromRGB(rgb[0], rgb[1], rgb[2]);
			let nUid = PetriNetFrequencyVisualizer.nodeUuid();
			if (trans.label != null) {
				ret.push(nUid+" [shape=box, label=\""+trans.label+"\n("+tbrResult.transExecutions[trans]+")\"; style=filled, fillcolor=\""+rgbHex+"\"]");
			}
			else {
				ret.push(nUid+" [shape=box, label=\" \", style=filled, fillcolor=black]");
			}
			uidMap[trans] = nUid;
		}
		for (let arcKey in petriNet.arcs) {
			let arc = petriNet.arcs[arcKey];
			let uid1 = uidMap[arc.source];
			let uid2 = uidMap[arc.target];
			let penwidth = 0.5 + Math.log10(1 + tbrResult.arcExecutions[arcKey]);
			ret.push(uid1+" -> "+uid2+" [label=\""+tbrResult.arcExecutions[arcKey]+"\", penwidth=\""+penwidth+"\"]");
		}
		ret.push("}");
		return ret.join('\n');
	}
}

try {
	require('../../pm4js.js');
	module.exports = {PetriNetFrequencyVisualizer: PetriNetFrequencyVisualizer};
	global.PetriNetFrequencyVisualizer = PetriNetFrequencyVisualizer;
}
catch (err) {
	// not in node
}

