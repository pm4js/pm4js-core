class Pm4JS {
	// version >= 0.0.20: license BSD-3-Clause
	
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

Pm4JS.VERSION = "0.0.25";
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

class DateUtils {
	static formatDateString(d) {
		return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+ ":" + ("0" + d.getSeconds()).slice(-2);
	}
}

try {
	require('../../pm4js.js');
	module.exports = {DateUtils: DateUtils};
	global.DateUtils = DateUtils;
}
catch (err) {
	// not in node
	//console.log(err);
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


// Implementation taken from:
// https://github.com/pineapplemachine/interval-tree-type-js

// Credit to these implementations for serving as a reference:
// https://github.com/IvanPinezhaninov/IntervalTree
// https://github.com/stanislavkozlovski/Red-Black-Tree

const Red = true;
const Black = false;

const SameValueZero = (a, b) => a === b || (a !== a && b !== b);

const IntervalComparator = (a, b) => b.high - a.high;

class IntervalTree{
    constructor(valuesEqual){
        this.valuesEqual = valuesEqual || SameValueZero;
        this.root = null;
        if(typeof(this.valuesEqual) !== "function"){
            throw new TypeError("Value equality argument must be a function.");
        }
    }
    // Helper to validate numeric inputs and throw helpful
    // errors when the inputs are invalid.
    static validate(point, description, nanok){
        const value = point.valueOf();
        if(typeof(value) !== "number"){
            throw new TypeError(`${description} must be a number.`);
        }
        if(!nanok && value !== value){
            throw new RangeError(`${description} must not be NaN.`);
        }
        return value;
    }
    // Returns true when the tree is empty and false otherwise.
    isEmpty(){
        return !this.root;
    }
    // Get the total number of intervals in the tree.
    getIntervalCount(){
        return this.root ? this.root.getIntervalCount() : 0;
    }
    // Insert a node into the tree associating a value with an interval.
    insert(low, high, value){
        // Validate input interval
        low = IntervalTree.validate(low, "Low bound", false);
        high = IntervalTree.validate(high, "High bound", false);
        if(high < low) throw new RangeError(
            `Invalid interval [${low}, ${high}]. ` + 
            "The high bound must be greater than or equal to the low bound."
        );
        // Handle the case where the tree is currently empty
        if(!this.root){
            this.root = new IntervalTreeNode(
                this.valuesEqual, low, high, null, Black
            );
            this.root.addInterval(low, high, value);
            return this.root;
        }
        // Otherwise, search for the place where this interval should be added
        let node = this.root;
        while(true){
            if(low < node.low){
                if(node.left){
                    node = node.left;
                }else{ // Add the interval to a new left child of this node
                    node.addLeftChild(this, low, high, value);
                    break;
                }
            }else if(low > node.low){
                if(node.right){
                    node = node.right;
                }else{ // Add the interval to a new right child of this node
                    node.addRightChild(this, low, high, value);
                    break;
                }
            }else{
                // Add the interval to this node (same low boundary)
                node.addInterval(low, high, value);
                node.addIntervalUpdateLimits();
                break;
            }
        }
    }
    // Remove the first matching interval from the tree.
    // Value equality checks use SameValueZero.
    remove(low, high, value){
        // Immediately abort if the tree is empty
        if(!this.root) return null;
        // Validate interval bounds
        low = IntervalTree.validate(low, "Low bound", true);
        high = IntervalTree.validate(high, "High bound", true);
        // Exit immediately if the input interval isn't valid
        if(high !== high || low !== low || high < low) return null;
        // Get the node that should contain this interval
        const node = this.root.getNodeWithInterval(low, high, value);
        // Abort if the interval wasn't found anywhere in the tree
        if(!node) return null;
        // Try to remove the interval
        const removedInterval = node.removeInterval(low, high, value);
        // No matching interval? Abort with null return value
        if(!removedInterval) return null;
        // If there are no more instances in the node, then remove the node
        if(node.intervals.length === 0) node.remove(this);
        // Return the removed interval
        return removedInterval;
    }
    // Remove all matching intervals from the tree.
    removeAll(low, high, value){
        // Immediately abort if the tree is empty
        if(!this.root) return null;
        // Validate interval bounds
        low = IntervalTree.validate(low, "Low bound", true);
        high = IntervalTree.validate(high, "High bound", true);
        // Exit immediately if the input interval isn't valid
        if(high !== high || low !== low || high < low) return null;
        // Get the node that should contain this interval
        const node = this.root.getNodeWithInterval(low, high, value);
        // Abort if the interval wasn't found anywhere in the tree
        if(!node) return null;
        // Try to remove all instances of the interval
        const removedIntervals = node.removeAllIntervals(low, high, value);
        // If there are no more instances in the node, then remove the node
        if(node.intervals.length === 0) node.remove(this);
        // Return the number of removed intervals
        return removedIntervals.length ? removedIntervals : null;
    }
    // Get whether a matching interval is contained in the tree.
    contains(low, high, value){
        // Immediately abort if the tree is empty
        if(!this.root) return null;
        // Validate interval bounds
        low = IntervalTree.validate(low, "Low bound", true);
        high = IntervalTree.validate(high, "High bound", true);
        // Exit immediately if the input interval isn't valid
        if(high !== high || low !== low || high < low) return null;
        // Get the node that should contain this interval
        const node = this.root.getNodeWithInterval(low, high, value);
        // Count the number of matching intervals
        return node && node.contains(low, high, value);
    }
    // Get an array of matching intervals in the tree.
    getContained(low, high, value){
        // Immediately abort if the tree is empty
        if(!this.root) return null;
        // Validate interval bounds
        low = IntervalTree.validate(low, "Low bound", true);
        high = IntervalTree.validate(high, "High bound", true);
        // Exit immediately if the input interval isn't valid
        if(high !== high || low !== low || high < low) return null;
        // Get the node that should contain this interval
        const node = this.root.getNodeWithInterval(low, high, value);
        // Handle the case where there was no matching node
        if(!node) return null;
        // Count the number of matching intervals
        const contained = node.getContainedIntervals(low, high, value);
        return contained.length ? contained : null;
    }
    // Enumerate all intervals that intersect a point
    *queryPoint(point){
        if(!this.root) return;
        point = IntervalTree.validate(point, "Point", true);
        // Exit immediately if the point input was NaN
        if(point !== point) return;
        // Search the tree, starting with the root
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(point >= node.low && point <= node.high){
                for(let interval of node.intervals){
                    if(interval.high >= point) yield interval;
                    else break;
                }
            }
            if(node.left &&
                point <= node.left.maximumHigh && point >= node.left.minimumLow
            ){
                stack.push(node.left);
            }
            if(node.right &&
                point <= node.right.maximumHigh && point >= node.right.minimumLow
            ){
                stack.push(node.right);
            }
        }
    }
    // Enumerate all intervals that end before or on a point
    *queryBeforePoint(point){
        if(!this.root) return;
        point = IntervalTree.validate(point, "Point", true);
        // Exit immediately if the point input was NaN
        if(point !== point) return;
        // Search the tree, starting with the root
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(point >= node.low){
                for(let i = node.intervals.length - 1; i >= 0; i--){
                    const interval = node.intervals[i];
                    if(interval.high <= point) yield interval;
                    else break;
                }
            }
            if(node.left && point >= node.left.minimumHigh){
                stack.push(node.left);
            }
            if(node.right && point >= node.right.minimumHigh){
                stack.push(node.right);
            }
        }
    }
    // Enumerate all intervals that begin after or on a point
    *queryAfterPoint(point){
        if(!this.root) return;
        point = IntervalTree.validate(point, "Point", true);
        // Exit immediately if the point input was NaN
        if(point !== point) return;
        // Search the tree, starting with the root
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(point <= node.low){
                for(let interval of node.intervals) yield interval;
            }
            if(node.left && point <= node.left.maximumLow){
                stack.push(node.left);
            }
            if(node.right && point <= node.right.maximumLow){
                stack.push(node.right);
            }
        }
    }
    // Enumerate all intervals that do NOT intersect a point
    // Intervals with a boundary exactly equal to the point are included
    // in the output.
    *queryExcludePoint(point){
        if(!this.root) return;
        point = IntervalTree.validate(point, "Point", true);
        // Exit immediately if the point input was NaN
        if(point !== point) return;
        // Search the tree, starting with the root
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(point <= node.low){
                for(let interval of node.intervals) yield interval;
            }else{
                for(let i = node.intervals.length - 1; i >= 0; i--){
                    const interval = node.intervals[i];
                    if(interval.high <= point) yield interval;
                    else break;
                }
            }
            if(node.left && (
                point >= node.left.minimumHigh || point <= node.left.maximumLow
            )){
                stack.push(node.left);
            }
            if(node.right && (
                point >= node.right.minimumHigh || point <= node.right.maximumLow
            )){
                stack.push(node.right);
            }
        }
    }
    // Enumerate all intervals that intersect another interval
    *queryInterval(low, high){
        if(!this.root) return;
        // Validate interval bounds
        low = IntervalTree.validate(low, "Low bound", true);
        high = IntervalTree.validate(high, "High bound", true);
        // Exit immediately if the input interval isn't valid
        if(high !== high || low !== low || high < low) return;
        // Search the tree, starting with the root
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(low <= node.high && high >= node.low){
                for(let interval of node.intervals){
                    if(interval.high >= low) yield interval;
                    else break;
                }
            }
            if(node.left &&
                high >= node.left.minimumLow && low <= node.left.maximumHigh
            ){
                stack.push(node.left);
            }
            if(node.right &&
                high >= node.right.minimumLow && low <= node.right.maximumHigh
            ){
                stack.push(node.right);
            }
        }
    }
    // Enumerate all intervals that are entirely contained within the input.
    *queryWithinInterval(low, high){
        if(!this.root) return;
        low = IntervalTree.validate(low, "Low bound", true);
        high = IntervalTree.validate(high, "High bound", true);
        // Exit immediately if the input interval isn't valid
        if(high !== high || low !== low || high < low) return null;
        // Search the tree, starting with the root
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(node.low >= low){
                for(let i = node.intervals.length - 1; i >= 0; i--){
                    const interval = node.intervals[i];
                    if(interval.high <= high) yield interval;
                    else break;
                }
            }
            if(node.left &&
                node.left.maximumLow >= low && node.left.minimumHigh <= high
            ){
                stack.push(node.left);
            }
            if(node.right &&
                node.right.maximumLow >= low && node.right.minimumHigh <= high
            ){
                stack.push(node.right);
            }
        }
    }
    // Enumerate all intervals that do NOT intersect another interval
    // Intervals with a low bound exactly equal to the high input bound,
    // or with a high bound exactly equal to the low input bound, are included
    // in the output.
    *queryExcludeInterval(low, high){
        if(!this.root) return;
        low = IntervalTree.validate(low, "Low bound", true);
        high = IntervalTree.validate(high, "High bound", true);
        // Exit immediately if the input interval isn't valid
        if(high !== high || low !== low || high < low) return null;
        // Search the tree, starting with the root
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(high <= node.low){
                for(let interval of node.intervals) yield interval;
            }else{
                for(let i = node.intervals.length - 1; i >= 0; i--){
                    const interval = node.intervals[i];
                    if(interval.high <= low) yield interval;
                    else break;
                }
            }
            if(node.left && (
                low >= node.left.minimumHigh || high <= node.left.maximumLow
            )){
                stack.push(node.left);
            }
            if(node.right && (
                low >= node.right.minimumHigh || high <= node.right.maximumLow
            )){
                stack.push(node.right);
            }
        }
    }
    // Enumerate all nodes in the tree (in no particular order)
    *nodes(){
        if(!this.root) return;
        let stack = [this.root];
        while(stack.length){
            const node = stack.pop();
            if(node.left) stack.push(node.left);
            if(node.right) stack.push(node.right);
            yield node;
        }
    }
    // Enumerate all the nodes in the tree (in ascending order)
    *nodesAscending(){
        let i = 0;
        let node = this.root && this.root.getLeftmostChild();
        while(node){
            yield node;
            node = node.getSuccessor();
        }
    }
    // Enumerate all the nodes in the tree (in descending order)
    *nodesDescending(){
        let node = this.root && this.root.getRightmostChild();
        while(node){
            yield node;
            node = node.getPredecessor();
        }
    }
    // Enumerate all intervals in the tree (in no particular order)
    *intervals(){
        for(let node of this.nodes()){
            // Note: for...of is about 40% as performant as of node v10.7.0
            // for(let interval of node.intervals) yield interval;
            for(let i = 0; i < node.intervals.length; i++){
                yield node.intervals[i];
            }
        }
    }
    // Enumerate all intervals in the tree (in ascending order)
    *ascending(){
        for(let node of this.nodesAscending()){
            for(let i = node.intervals.length - 1; i >= 0; i--){
                yield node.intervals[i];
            }
        }
    }
    // Enumerate all intervals in the tree (in descending order)
    *descending(){
        for(let node of this.nodesDescending()){
            // Note: for...of is about 40% as performant as of node v10.7.0
            // for(let interval of node.intervals) yield interval;
            for(let i = 0; i < node.intervals.length; i++){
                yield node.intervals[i];
            }
        }
    }
    // Enumerate intervals (in no particular order)
    [Symbol.iterator](){
        return this.intervals();
    }
}

// An IntervalTree contains IntervalTreeNodes
class IntervalTreeNode{
    static getIntervalsArray(valuesEqual){
        return new SortedArray(IntervalComparator, (
            (a, b) => a.high === b.high && valuesEqual(a.value, b.value)
        ));
    }
    constructor(valuesEqual, low, high, parent, color){
        this.valuesEqual = valuesEqual;
        this.intervals = IntervalTreeNode.getIntervalsArray(valuesEqual);
        // The color of the node, for balancing
        this.color = color;
        // The interval bounds for this node
        this.low = low;
        this.high = high;
        // The interval bounds for this entire subtree
        this.minimumLow = low;
        this.maximumLow = low;
        this.minimumHigh = high;
        this.maximumHigh = high;
        // The node's parent and children
        this.parent = parent;
        this.left = null;
        this.right = null;
    }
    
    // Add a new interval to the node.
    // Typically a boundary limit correcting method needs to be called after
    // this one, like insertUpdateLimits (for newly-added nodes) or
    // addIntervalUpdateLimits (when adding to existing nodes).
    addInterval(low, high, value){
        const interval = new Interval(low, high, value);
        this.intervals.insert(interval);
        if(interval.high < this.minimumHigh) this.minimumHigh = interval.high;
        if(interval.high > this.maximumHigh) this.maximumHigh = interval.high;
        if(interval.high > this.high) this.high = interval.high;
    }
    // Remove an interval from the node. Returns the interval
    // if one was removed, or null if there was no matching interval.
    // The caller should check if this was the last interval and,
    // if it was, should then remove the node from the tree entirely.
    removeInterval(low, high, value){
        const interval = new Interval(low, high, value);
        const index = this.intervals.indexOf(interval);
        if(index < 0) return null;
        const removedInterval = this.intervals.splice(index, 1)[0];
        if(this.intervals.length &&
            (index === 0 || index === this.intervals.length)
        ){
            this.high = this.intervals[0].high;
            this.removeUpdateLimits();
        }
        return removedInterval;
    }
    // Remove all matching intervals from the node.
    // Returns an array of the removed intervals.
    // The caller should check if there are no remaining intervals and,
    // if not, should then remove the node from the tree entirely.
    removeAllIntervals(low, high, value){
        const interval = new Interval(low, high, value);
        const removedIntervals = this.intervals.removeAll(interval);
        // TODO: This should not have to be done in every case
        if(removedIntervals.length && this.intervals.length){
            this.removeUpdateLimits();
        }
        return removedIntervals;
    }
    // Get whether the node contains a matching interval
    // Assumes that the interval low bound is already known to match this node.
    contains(low, high, value){
        const interval = new Interval(low, high, value);
        const index = this.intervals.indexOf(interval);
        return index < 0 ? null : this.intervals[index];
    }
    // Get all matching intervals
    // Assumes that the interval low bound is already known to match this node.
    getContainedIntervals(low, high, value){
        const interval = new Interval(low, high, value);
        return this.intervals.getEqualValues(interval);
    }
    
    // Get the parent's opposite child node.
    getSibling(){
        if(!this.parent) return null;
        if(this === this.parent.left) return this.parent.right;
        else return this.parent.left;
    }
    // Get the leftmost node in the subtree
    // for which this node is the root.
    getLeftmostChild(){
        let node = this;
        while(node.left) node = node.left;
        return node;
    }
    // Get the rightmost node in the subtree
    // for which this node is the root.
    getRightmostChild(){
        let node = this;
        while(node.right) node = node.right;
        return node;
    }
    // Get the next node in the sort order.
    getSuccessor(){
        if(this.right) return this.right.getLeftmostChild();
        let node = this;
        while(node){
            if(node.parent && node === node.parent.left) return node.parent;
            node = node.parent;
        }
    }
    // Get the next node in the sort order.
    getPredecessor(){
        if(this.left) return this.left.getRightmostChild();
        let node = this;
        while(node){
            if(node.parent && node === node.parent.right) return node.parent;
            node = node.parent;
        }
    }
    // Remove the parent node's reference to this one as a child node.
    makeOrphan(){
        if(!this.parent) return;
        if(this === this.parent.left) this.parent.left = null;
        else this.parent.right = null;
    }
    
    // Compute the height of this subtree. Requires a complete traversal.
    // A node with no children has a subtree height of 0.
    getHeight(){
        let maxHeight = 0;
        const stack = [{node: this, height: 0}];
        while(stack.length){
            const next = stack.pop();
            if(next.height > maxHeight){
                maxHeight = next.height;
            }
            if(next.node.left){
                stack.push({node: next.node.left, height: next.height + 1});
            }
            if(next.node.right){
                stack.push({node: next.node.right, height: next.height + 1});
            }
        }
        return maxHeight;
    }
    // Get the number of intervals in the subtree.
    getIntervalCount(){
        let intervalCount = 0;
        const stack = [this];
        while(stack.length){
            const node = stack.pop();
            if(node.left) stack.push(node.left);
            if(node.right) stack.push(node.right);
            intervalCount += node.intervals.length;
        }
        return intervalCount;
    }
    
    // Add a child on the left side.
    addLeftChild(tree, low, high, value){
        this.left = new IntervalTreeNode(
            this.valuesEqual, low, high, this, Red
        );
        this.left.addInterval(low, high, value);
        this.left.insertUpdateLimits();
        this.left.insertionFix(tree);
        return this.left;
    }
    // Add a child on the right side.
    addRightChild(tree, low, high, value){
        this.right = new IntervalTreeNode(
            this.valuesEqual, low, high, this, Red
        );
        this.right.addInterval(low, high, value);
        this.right.insertUpdateLimits();
        this.right.insertionFix(tree);
        return this.right;
    }
    // Ensure that the tree retains valid red-black structure following
    // the insertion of a new node.
    insertionFix(tree, child){
        let node = this;
        // While node and parent are both Red
        while(node.color === Red && node.parent.color === Red){
            const parent = node.parent;
            const uncle = parent.getSibling();
            if(uncle && uncle.color === Red){ // Parent's sibling is Red
                uncle.color = Black;
                parent.color = Black;
                parent.parent.color = Red;
                node = parent.parent;
            }else{
                if((parent.left === node) !== (parent.parent.left === parent)){
                    node.rotate(tree);
                    node.rotate(tree);
                }else{
                    parent.rotate(tree);
                    node = parent;
                }
            }
            if(!node.parent){
                break;
            }
        }
        if(!node.parent){
            node.color = Black;
        }
    }
    
    // Get the node containing a given interval, if any exists.
    getNodeWithInterval(low, high, value){
        let node = this;
        while(node){
            if(low < node.low){
                if(!node.left) return null;
                node = node.left;
            }else if(low > node.low){
                if(!node.right) return null;
                node = node.right;
            }else{
                return node;
            }
        }
        return null;
    }
    // Delete this node from the tree.
    // This method may swap information with another node (the successor)
    // and delete that node instead of this one.
    remove(tree){
        let replaceWith;
        if(this.left && this.right){
            const next = this.right.getLeftmostChild();
            this.low = next.low;
            this.high = next.high;
            this.intervals = next.intervals;
            this.removeUpdateLimits();
            next.handleRemoval(tree); 
        }else{
            this.handleRemoval(tree);
        }
    }
    // Delete a node with one child or no children from the tree.
    // This helper is called by the `remove` method.
    handleRemoval(tree){
        // Get the one child node, if there is one.
        const child = this.left || this.right;
        // Handle the case where this node is the root
        if(!this.parent){
            tree.root = child;
            if(child){
                child.parent = null;
                child.color = Black;
            }
        // Delete a red node (which by implication has no children)
        }else if(this.color === Red){
            this.makeOrphan();
        // Delete a black node with a red child
        }else if(child && child.color === Red){
            this.intervals = child.intervals;
            this.low = child.low;
            this.high = child.high;
            this.minimumLow = child.minimumLow;
            this.maximumLow = child.maximumLow;
            this.minimumHigh = child.minimumHigh;
            this.maximumHigh = child.maximumHigh;
            this.left = child.left;
            this.right = child.right;
        // Delete a black node with a black child
        // Note: This case should not actually be reachable?
        }else if(child){
            this.swapWithChild(child);
            child.removalFix(tree);
            this.makeOrphan();
        // Delete a black node with no children
        }else{
            this.removalFix(tree);
            this.makeOrphan();
        }
        // Update interval information
        if(this.parent){
            this.parent.removeUpdateLimits();
            // Note: A reference implementation used this behavior instead.
            // This change did not cause issues during extensive testing.
            // Still, if bugs occur, it may be because of this change.
            // this.parent.immediateUpdateLimits();
            // if(this.parent.parent) this.parent.parent.removeUpdateLimits();
        }
    }
    // Ensure that the tree retains valid red-black structure following
    // the removal of a node that may have disrupted the structure.
    removalFix(tree){
        let node = this;
        while(node.color === Black && node.parent){
            let sibling = node.getSibling();
            if(sibling.color === Red){
                sibling.rotate(tree);
                sibling = node.getSibling();
            }
            if(
                (!sibling.left || sibling.left.color === Black) &&
                (!sibling.right || sibling.right.color === Black)
            ){
                sibling.color = Red;
                node = node.parent;
            }else{
                if(sibling === sibling.parent.left && (
                    !sibling.left || sibling.left.color === Black
                )){
                    sibling = sibling.rotateLeft(tree);
                }else if(sibling === sibling.parent.right && (
                    !sibling.right || sibling.right.color === Black
                )){
                    sibling = sibling.rotateRight(tree);
                }
                sibling.rotate(tree);
                node = node.parent.getSibling();
            }
        }
        node.color = Black;
    }
    
    // Rotate right if this is the left child of the parent, or rotate
    // left if this is the right child.
    rotate(tree){
        if(this === this.parent.left){
            this.parent.rotateRight(tree);
        }else{
            this.parent.rotateLeft(tree);
        }
    }
    // Effectively switch places for this node and its right child.
    rotateLeft(tree){
        const child = this.right;
        this.swapWithChild(tree, child);
        this.parent = child;
        this.right = child.left;
        if(child.left) child.left.parent = this;
        child.left = this;
        this.rotateCommon(child);
        return child;
    }
    // Effectively switch places for this node and its left child.
    rotateRight(tree){
        const child = this.left;
        this.swapWithChild(tree, child);
        this.parent = child;
        this.left = child.right;
        if(child.right) child.right.parent = this;
        child.right = this;
        this.rotateCommon(child);
        return child;
    }
    // Helper used by rotateLeft and rotateRight operations.
    rotateCommon(child){
        const swapColor = this.color;
        this.color = child.color;
        child.color = swapColor;
        this.immediateUpdateLimits();
        if(child.minimumLow > this.minimumLow){
            child.minimumLow = this.minimumLow;
        }
        if(child.maximumLow < this.maximumLow){
            child.maximumLow = this.maximumLow;
        }
        if(child.minimumHigh > this.minimumHigh){
            child.minimumHigh = this.minimumHigh;
        }
        if(child.maximumHigh < this.maximumHigh){
            child.maximumHigh = this.maximumHigh;
        }
    }
    // Make a child node become the child of this node's parent, instead.
    // This is one part of a rotation operation.
    swapWithChild(tree, child){
        if(child) child.parent = this.parent;
        if(!this.parent){
            tree.root = child;
        }else if(this === this.parent.left){
            this.parent.left = child;
        }else{
            this.parent.right = child;
        }
    }
    
    // Update minimumLow and maximumHigh interval bounds after inserting this node.
    // Propagates updates up to parents when needed.
    insertUpdateLimits(){
        let node = this;
        let changed = true;
        while(node.parent && changed){
            changed = false;
            if(node.parent.minimumLow > this.minimumLow){
                node.parent.minimumLow = this.minimumLow;
                changed = true;
            }
            if(node.parent.maximumLow < this.maximumLow){
                node.parent.maximumLow = this.maximumLow;
                changed = true;
            }
            if(node.parent.minimumHigh > this.minimumHigh){
                node.parent.minimumHigh = this.minimumHigh;
                changed = true;
            }
            if(node.parent.maximumHigh < this.maximumHigh){
                node.parent.maximumHigh = this.maximumHigh;
                changed = true;
            }
            node = node.parent;
        }
    }
    // Update maximumHigh interval bounds after adding a new interval to this node.
    // Propagates updates up to parents when needed.
    addIntervalUpdateLimits(){
        let node = this.parent;
        let changed = true;
        while(node && changed){
            changed = false;
            if(node.minimumHigh > this.minimumHigh){
                node.minimumHigh = this.minimumHigh;
                changed = true;
            }
            if(node.maximumHigh < this.maximumHigh){
                node.maximumHigh = this.maximumHigh;
                changed = true;
            }
            node = node.parent;
        }
    }
    // Update minimumLow and maximumHigh interval bounds after replacing a removed
    // node with this node. Propagates updates up to parents when needed.
    removeUpdateLimits(){
        let node = this;
        while(node){
            // TODO: Under what conditions can this exit without continuing
            // to traverse the rest of the nodes to the root?
            node.immediateUpdateLimits();
            node = node.parent;
        }
    }
    // Helper to determine minimumLow and maximumHigh interval bounds for the
    // entire subtree based on the information in this node and its
    // immediate children.
    immediateUpdateLimits(){
        // Since nodes are in ascending order of length left-to-right,
        // computing the extreme low interval bounds is straightforward.
        this.minimumLow = this.left ? this.left.minimumLow : this.low;
        this.maximumLow = this.right ? this.right.maximumLow : this.low;
        // Maximum interval bounds are effectively:
        // max|min(high bound for this, for left child, for right child)
        this.minimumHigh = this.intervals[this.intervals.length - 1].high;
        this.maximumHigh = this.high; // Should always equal intervals[0].high
        if(this.left){
            if(this.left.minimumHigh < this.minimumHigh){
                this.minimumHigh = this.left.minimumHigh;
            }
            if(this.left.maximumHigh > this.maximumHigh){
                this.maximumHigh = this.left.maximumHigh;
            }
        }
        if(this.right){
            if(this.right.minimumHigh < this.minimumHigh){
                this.minimumHigh = this.right.minimumHigh;
            }
            if(this.right.maximumHigh > this.maximumHigh){
                this.maximumHigh = this.right.maximumHigh;
            }
        }
    }
    
    // Extremely useful stringification tools for debugging
    // Get a string representation of this subtree to log to a CLI
    // toDebugString(indent, label){
    //     indent = indent || "";
    //     label = label || "ROOT";
    //     const istr = i => `\x1b[90m[${i.low}, ${i.high}]:\x1b[39m ${i.value}`
    //     let str = (indent + label + ":: " +
    //         `\x1b[92m${this.low}\x1b[39m ` +
    //         "\x1b[" + (this.color ? "91mRED" : "94mBLK") + "\x1b[39m : " +
    //         `(${this.intervals.map(istr).join(", ")}) ` +
    //         `\x1b[90mp.\x1b[92m${this.parent && this.parent.low}\x1b[39m ` +
    //         `[${this.minimumLow},${this.maximumLow}..${this.minimumHigh},${this.maximumHigh}]`
    //     );
    //     if(this.left) str += "\n" + this.left.toDebugString(indent + "  ", "L");
    //     if(this.right) str += "\n" + this.right.toDebugString(indent + "  ", "R");
    //     return str;
    // }
    // Log a subtree string representation to a chrome DevTools console
    // log(){
    //     for(let l of this.toDebugString().split("\n")){
    //         const p = require("ansicolor").parse(l);
    //         console.log(...p.asChromeConsoleLogArguments);
    //     }
    // }
}

// An IntervalTreeNode contains Intervals
class Interval{
    constructor(low, high, value){
        this.low = low;
        this.high = high;
        this.value = value;
    }
}

// Comparator function used by SortedArray when none is passed explicitly
const DefaultComparator = ((a, b) => (
    a < b ? -1 : (a > b ? +1 : 0)
));

// Array type with sorted insertion methods and optimized
// implementations of some Array methods.
// SortedArray does not stop you from pushing, shifting,
// splicing, or assigning values at an index.
// However, if these things are not done judiciously, then
// the array will no longer be sorted and its methods will
// no longer function correctly.
class SortedArray extends Array{
    // Construct a new SortedArray. Uses Array.sort to sort
    // the input collection, if any; the sort may be unstable.
    constructor(){
        let values = null;
        let valuesEqual = null;
        let comparator = null;
        let reversedComparator = null;
        // new SortedArray(comparator)
        if(arguments.length === 1 &&
            typeof(arguments[0]) === "function"
        ){
            comparator = arguments[0];
        // new SortedArray(comparator, valuesEqual)
        }else if(arguments.length === 2 &&
            typeof(arguments[0]) === "function" &&
            typeof(arguments[1]) === "function"
        ){
            comparator = arguments[0];
            valuesEqual = arguments[1];
        // new SortedArray(values, comparator?, valuesEqual?)
        }else{
            values = arguments[0];
            comparator = arguments[1];
            valuesEqual = arguments[2];
        }
        if(comparator && typeof(comparator) !== "function"){
            // Verify comparator input
            throw new TypeError("Comparator argument must be a function.");
        }
        if(valuesEqual && typeof(valuesEqual) !== "function"){
            // Verify comparator input
            throw new TypeError("Value equality argument must be a function.");
        }
        // new SortedArray(length, cmp?, eq?) - needed by some inherited methods
        if(typeof(values) === "number"){
            if(!Number.isInteger(values) || values < 0){
                throw new RangeError("Invalid array length");
            }
            super(values);
        // new SortedArray(SortedArray, cmp?, eq?) - same or unspecified comparator
        }else if(values instanceof SortedArray && (
            !comparator || values.comparator === comparator
        )){
            super();
            super.push(...values);
            comparator = values.comparator;
            reversedComparator = values.reversedComparator;
            if(!valuesEqual) valuesEqual = values.valuesEqual;
        // new SortedArray(Array, cmp?, eq?)
        }else if(Array.isArray(values)){
            super();
            super.push(...values);
            super.sort(comparator || DefaultComparator);
            if(values instanceof SortedArray && !valuesEqual){
                valuesEqual = values.valuesEqual;
            }
        // new SortedArray(iterable, cmp?, eq?)
        }else if(values && typeof(values[Symbol.iterator]) === "function"){
            super();
            for(let value of values) super.push(value);
            super.sort(comparator || DefaultComparator);
        // new SortedArray(object with length, cmp?, eq?) - e.g. `arguments`
        }else if(values && typeof(values) === "object" &&
            Number.isFinite(values.length)
        ){
            super();
            for(let i = 0; i < values.length; i++) super.push(values[i]);
            super.sort(comparator || DefaultComparator);
        // new SortedArray()
        // new SortedArray(comparator)
        // new SortedArray(comparator, valuesEqual)
        }else if(!values){
            super();
        // new SortedArray(???)
        }else{
            throw new TypeError(
                "Unhandled values input type. Expected an iterable."
            );
        }
        this.valuesEqual = valuesEqual || SameValueZero;
        this.comparator = comparator || DefaultComparator;
        this.reversedComparator = reversedComparator;
    }
    // Construct a SortedArray with elements given as arguments.
    static of(...values){
        return new SortedArray(values);
    }
    // Construct a SortedArray from assumed-sorted arguments.
    static ofSorted(...values){
        const array = new SortedArray();
        Array.prototype.push.apply(array, values);
        return array;
    }
    // Construct a SortedArray from the given inputs.
    static from(values, comparator, valuesEqual){
        return new SortedArray(values, comparator, valuesEqual);
    }
    // Construct a SortedArray from assumed-sorted values.
    static fromSorted(values, comparator, valuesEqual){
        const array = new SortedArray(null, comparator, valuesEqual);
        if(Array.isArray(values)){
            Array.prototype.push.apply(array, values);
        }else{
            for(let value of values) Array.prototype.push.call(array, value);
        }
        return array;
    }
    
    /// SortedArray methods
    
    // Insert a value into the list.
    insert(value){
        const index = this.lastInsertionIndexOf(value);
        this.splice(index, 0, value);
        return this.length;
    }
    // Insert an iterable of assumed-sorted values into the list
    // This will typically be faster than calling `insert` in a loop.
    insertSorted(values){
        // Optimized implementation for arrays and array-like objects
        if(values && typeof(values) === "object" &&
            Number.isFinite(values.length)
        ){
            // Exit immediately if the values array is empty
            if(values.length === 0){
                return this.length;
            }
            // If the last element in the input precedes the first element
            // in the array, the input can be prepended in one go.
            const lastInsertionIndex = this.lastInsertionIndexOf(
                values[values.length - 1]
            );
            if(lastInsertionIndex === 0){
                this.unshift(...values);
                return this.length;
            }
            // If the first element would go in the same place in the array
            // as the last element, then it can be spliced in all at once.
            const firstInsertionIndex =  this.lastInsertionIndexOf(values[0]);
            if(firstInsertionIndex === lastInsertionIndex){
                this.splice(firstInsertionIndex, 0, ...values);
                return this.length;
            }
            // Array contents must be interlaced
            let insertIndex = 0;
            for(let valIndex = 0; valIndex < values.length; valIndex++){
                const value = values[valIndex];
                insertIndex = this.lastInsertionIndexOf(value, insertIndex);
                // If this element was at the end of the array, then every other
                // element of the input is too and they can be appended at once.
                if(insertIndex === this.length && valIndex < values.length - 1){
                    this.push(...values.slice(valIndex));
                    return this.length;
                }else{
                    this.splice(insertIndex++, 0, value);
                }
            }
            return this.length;
        // Generalized implementation for any iterable
        }else if(values && typeof(values[Symbol.iterator]) === "function"){
            let insertIndex = 0;
            for(let value of values){
                insertIndex = this.lastInsertionIndexOf(value, insertIndex);
                this.splice(insertIndex++, 0, value);
            }
            return this.length;
        // Produce an error if the input isn't an acceptable type.
        }else{
            throw new TypeError("Expected an iterable list of values.");
        }
    }
    // Remove the first matching value.
    // Returns true if a matching element was found and removed,
    // or false if no matching element was found.
    remove(value){
        const index = this.indexOf(value);
        if(index >= 0){
            this.splice(index, 1);
            return true;
        }else{
            return false;
        }
    }
    // Remove the last matching value.
    // Returns true if a matching element was found and removed,
    // or false if no matching element was found.
    removeLast(value){
        const index = this.lastIndexOf(value);
        if(index >= 0){
            this.splice(index, 1);
            return true;
        }else{
            return false;
        }
    }
    // Remove all matching values.
    // Returns the removed elements as a new SortedArray.
    removeAll(value){
        let index = this.firstInsertionIndexOf(value);
        const removed = new SortedArray();
        removed.valuesEqual = this.valuesEqual;
        removed.comparator = this.comparator;
        removed.reversedComparator = this.reversedComparator;
        while(index < this.length &&
            this.comparator(this[index], value) === 0
        ){
            if(this.valuesEqual(this[index], value)){
                Array.prototype.push.call(removed, this[index]);
                this.splice(index, 1);
            }else{
                index++;
            }
        }
        return removed;
    }
    // Get all equal values.
    // Returns the equivalent elements as a new SortedArray.
    getEqualValues(value){
        let index = this.firstInsertionIndexOf(value);
        const equal = new SortedArray();
        equal.valuesEqual = this.valuesEqual;
        equal.comparator = this.comparator;
        equal.reversedComparator = this.reversedComparator;
        while(index < this.length &&
            this.comparator(this[index], value) === 0
        ){
            if(this.valuesEqual(this[index], value)){
                Array.prototype.push.call(equal, this[index]);
            }
            index++;
        }
        return equal;
    }
    
    // Returns the index of the first equal element,
    // or the index that such an element should
    // be inserted at if there is no equal element.
    firstInsertionIndexOf(value, fromIndex, endIndex){
        const from = (typeof(fromIndex) !== "number" || fromIndex !== fromIndex ?
            0 : (fromIndex < 0 ? Math.max(0, this.length + fromIndex) : fromIndex)
        );
        const end = (typeof(endIndex) !== "number" || endIndex !== endIndex ?
            this.length : (endIndex < 0 ? this.length + endIndex :
                Math.min(this.length, endIndex)
            )
        );
        let min = from - 1;
        let max = end;
        while(1 + min < max){
            const mid = min + Math.floor((max - min) / 2);
            const cmp = this.comparator(value, this[mid]);
            if(cmp > 0) min = mid;
            else max = mid;
        }
        return max;
    }
    // Returns the index of the last equal element,
    // or the index that such an element should
    // be inserted at if there is no equal element.
    lastInsertionIndexOf(value, fromIndex, endIndex){
        const from = (typeof(fromIndex) !== "number" || fromIndex !== fromIndex ?
            0 : (fromIndex < 0 ? Math.max(0, this.length + fromIndex) : fromIndex)
        );
        const end = (typeof(endIndex) !== "number" || endIndex !== endIndex ?
            this.length : (endIndex < 0 ? this.length + endIndex :
                Math.min(this.length, endIndex)
            )
        );
        let min = from - 1;
        let max = end;
        while(1 + min < max){
            const mid = min + Math.floor((max - min) / 2);
            const cmp = this.comparator(value, this[mid]);
            if(cmp >= 0) min = mid;
            else max = mid;
        }
        return max;
    }
    // Returns the index of the first equal element, or -1 if
    // there is no equal element.
    indexOf(value, fromIndex){
        let index = this.firstInsertionIndexOf(value, fromIndex);
        if(index >= 0 && index < this.length &&
            this.valuesEqual(this[index], value)
        ){
            return index;
        }
        while(++index < this.length &&
            this.comparator(value, this[index]) === 0
        ){
            if(this.valuesEqual(this[index], value)) return index;
        }
        return -1;
    }
    // Returns the index of the last equal element, or -1 if
    // there is no equal element.
    lastIndexOf(value, fromIndex){
        let index = this.lastInsertionIndexOf(value, 0, fromIndex);
        if(index >= 0 && index < this.length &&
            this.valuesEqual(this[index], value)
        ){
            return index;
        }
        while(--index >= 0 &&
            this.comparator(value, this[index]) === 0
        ){
            if(this.valuesEqual(this[index], value)) return index;
        }
        return -1;
    }
    
    // Returns true when the value is contained within the
    // array, and false when not.
    includes(value, fromIndex){
        return this.indexOf(value, fromIndex) >= 0;
    }
    // Get a copy of this list containing only those elements
    // which satisfy a predicate function.
    // The output is also a SortedArray.
    filter(predicate){
        if(typeof(predicate) !== "function"){
            throw new TypeError("Predicate must be a function.");
        }
        const array = new SortedArray(null, this.comparator);
        array.reversedComparator = this.reversedComparator;
        for(let element of this){
            if(predicate(element)) Array.prototype.push.call(array, element);
        }
        return array;
    }
    // Reverse the list. This method also inverts the comparator
    // function, meaning later insertions respect the new order.
    reverse(){
        super.reverse();
        if(this.reversedComparator){
            const t = this.comparator;
            this.comparator = this.reversedComparator;
            this.reversedComparator = t;
        }else{
            const t = this.comparator;
            this.reversedComparator = this.comparator;
            this.comparator = (a, b) => t(b, a);
        }
    }
    // Get a slice out of the array. Returns a SortedArray.
    slice(){
        const slice = Array.prototype.slice.apply(this, arguments);
        slice.valuesEqual = this.valuesEqual;
        slice.comparator = this.comparator;
        slice.reversedComparator = this.reversedComparator;
        return slice;
    }
    // Changes the array's comparator and re-sorts its contents.
    // Uses Array.sort, which may be unstable.
    sort(comparator){
        comparator = comparator || DefaultComparator;
        if(comparator === this.comparator) return;
        this.comparator = comparator;
        this.reversedComparator = null;
        super.sort(comparator);
    }
    // Remove and/or insert elements in the array.
    splice(){
        const splice = Array.prototype.splice.apply(this, arguments);
        splice.valuesEqual = this.valuesEqual;
        splice.comparator = this.comparator;
        splice.reversedComparator = this.reversedComparator;
        return splice;
    }
    
    // Can these be done in a less hacky way?
    concat(){
        this.constructor = Array;
        const array = Array.prototype.concat.apply(this, arguments);
        this.constructor = SortedArray;
        return array;
    }
    flat(){
        this.constructor = Array;
        const array = Array.prototype.flat.apply(this, arguments);
        this.constructor = SortedArray;
        return array;
    }
    flatMap(){
        this.constructor = Array;
        const array = Array.prototype.flatMap.apply(this, arguments);
        this.constructor = SortedArray;
        return array;
    }
    map(){
        this.constructor = Array;
        const array = Array.prototype.map.apply(this, arguments);
        this.constructor = SortedArray;
        return array;
    }
}

IntervalTree.Interval = Interval;
IntervalTree.Node = IntervalTreeNode;
IntervalTreeNode.Red = Red;
IntervalTreeNode.Black = Black;
IntervalTreeNode.IntervalComparator = IntervalComparator;

try {
	module.exports = {IntervalTree: IntervalTree, IntervalTreeNode: IntervalTreeNode, Interval: Interval, SortedArray: SortedArray};
	global.IntervalTree = IntervalTree;
	global.IntervalTreeNode = IntervalTreeNode;
	global.Interval = Interval;
	global.SortedArray = SortedArray;
}
catch (err) {
	// not in Node.JS
	//console.log(err);
}


"use strict";

var numeric = (typeof exports === "undefined")?(function numeric() {}):(exports);
if(typeof global !== "undefined") { global.numeric = numeric; }

numeric.version = "1.2.6";

// 1. Utility functions
numeric.bench = function bench (f,interval) {
    var t1,t2,n,i;
    if(typeof interval === "undefined") { interval = 15; }
    n = 0.5;
    t1 = new Date();
    while(1) {
        n*=2;
        for(i=n;i>3;i-=4) { f(); f(); f(); f(); }
        while(i>0) { f(); i--; }
        t2 = new Date();
        if(t2-t1 > interval) break;
    }
    for(i=n;i>3;i-=4) { f(); f(); f(); f(); }
    while(i>0) { f(); i--; }
    t2 = new Date();
    return 1000*(3*n-1)/(t2-t1);
}

numeric._myIndexOf = (function _myIndexOf(w) {
    var n = this.length,k;
    for(k=0;k<n;++k) if(this[k]===w) return k;
    return -1;
});
numeric.myIndexOf = (Array.prototype.indexOf)?Array.prototype.indexOf:numeric._myIndexOf;

numeric.Function = Function;
numeric.precision = 4;
numeric.largeArray = 50;

numeric.prettyPrint = function prettyPrint(x) {
    function fmtnum(x) {
        if(x === 0) { return '0'; }
        if(isNaN(x)) { return 'NaN'; }
        if(x<0) { return '-'+fmtnum(-x); }
        if(isFinite(x)) {
            var scale = Math.floor(Math.log(x) / Math.log(10));
            var normalized = x / Math.pow(10,scale);
            var basic = normalized.toPrecision(numeric.precision);
            if(parseFloat(basic) === 10) { scale++; normalized = 1; basic = normalized.toPrecision(numeric.precision); }
            return parseFloat(basic).toString()+'e'+scale.toString();
        }
        return 'Infinity';
    }
    var ret = [];
    function foo(x) {
        var k;
        if(typeof x === "undefined") { ret.push(Array(numeric.precision+8).join(' ')); return false; }
        if(typeof x === "string") { ret.push('"'+x+'"'); return false; }
        if(typeof x === "boolean") { ret.push(x.toString()); return false; }
        if(typeof x === "number") {
            var a = fmtnum(x);
            var b = x.toPrecision(numeric.precision);
            var c = parseFloat(x.toString()).toString();
            var d = [a,b,c,parseFloat(b).toString(),parseFloat(c).toString()];
            for(k=1;k<d.length;k++) { if(d[k].length < a.length) a = d[k]; }
            ret.push(Array(numeric.precision+8-a.length).join(' ')+a);
            return false;
        }
        if(x === null) { ret.push("null"); return false; }
        if(typeof x === "function") { 
            ret.push(x.toString());
            var flag = false;
            for(k in x) { if(x.hasOwnProperty(k)) { 
                if(flag) ret.push(',\n');
                else ret.push('\n{');
                flag = true; 
                ret.push(k); 
                ret.push(': \n'); 
                foo(x[k]); 
            } }
            if(flag) ret.push('}\n');
            return true;
        }
        if(x instanceof Array) {
            if(x.length > numeric.largeArray) { ret.push('...Large Array...'); return true; }
            var flag = false;
            ret.push('[');
            for(k=0;k<x.length;k++) { if(k>0) { ret.push(','); if(flag) ret.push('\n '); } flag = foo(x[k]); }
            ret.push(']');
            return true;
        }
        ret.push('{');
        var flag = false;
        for(k in x) { if(x.hasOwnProperty(k)) { if(flag) ret.push(',\n'); flag = true; ret.push(k); ret.push(': \n'); foo(x[k]); } }
        ret.push('}');
        return true;
    }
    foo(x);
    return ret.join('');
}

numeric.parseDate = function parseDate(d) {
    function foo(d) {
        if(typeof d === 'string') { return Date.parse(d.replace(/-/g,'/')); }
        if(!(d instanceof Array)) { throw new Error("parseDate: parameter must be arrays of strings"); }
        var ret = [],k;
        for(k=0;k<d.length;k++) { ret[k] = foo(d[k]); }
        return ret;
    }
    return foo(d);
}

numeric.parseFloat = function parseFloat_(d) {
    function foo(d) {
        if(typeof d === 'string') { return parseFloat(d); }
        if(!(d instanceof Array)) { throw new Error("parseFloat: parameter must be arrays of strings"); }
        var ret = [],k;
        for(k=0;k<d.length;k++) { ret[k] = foo(d[k]); }
        return ret;
    }
    return foo(d);
}

numeric.parseCSV = function parseCSV(t) {
    var foo = t.split('\n');
    var j,k;
    var ret = [];
    var pat = /(([^'",]*)|('[^']*')|("[^"]*")),/g;
    var patnum = /^\s*(([+-]?[0-9]+(\.[0-9]*)?(e[+-]?[0-9]+)?)|([+-]?[0-9]*(\.[0-9]+)?(e[+-]?[0-9]+)?))\s*$/;
    var stripper = function(n) { return n.substr(0,n.length-1); }
    var count = 0;
    for(k=0;k<foo.length;k++) {
      var bar = (foo[k]+",").match(pat),baz;
      if(bar.length>0) {
          ret[count] = [];
          for(j=0;j<bar.length;j++) {
              baz = stripper(bar[j]);
              if(patnum.test(baz)) { ret[count][j] = parseFloat(baz); }
              else ret[count][j] = baz;
          }
          count++;
      }
    }
    return ret;
}

numeric.toCSV = function toCSV(A) {
    var s = numeric.dim(A);
    var i,j,m,n,row,ret;
    m = s[0];
    n = s[1];
    ret = [];
    for(i=0;i<m;i++) {
        row = [];
        for(j=0;j<m;j++) { row[j] = A[i][j].toString(); }
        ret[i] = row.join(', ');
    }
    return ret.join('\n')+'\n';
}

numeric.getURL = function getURL(url) {
    var client = new XMLHttpRequest();
    client.open("GET",url,false);
    client.send();
    return client;
}

numeric.imageURL = function imageURL(img) {
    function base64(A) {
        var n = A.length, i,x,y,z,p,q,r,s;
        var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var ret = "";
        for(i=0;i<n;i+=3) {
            x = A[i];
            y = A[i+1];
            z = A[i+2];
            p = x >> 2;
            q = ((x & 3) << 4) + (y >> 4);
            r = ((y & 15) << 2) + (z >> 6);
            s = z & 63;
            if(i+1>=n) { r = s = 64; }
            else if(i+2>=n) { s = 64; }
            ret += key.charAt(p) + key.charAt(q) + key.charAt(r) + key.charAt(s);
            }
        return ret;
    }
    function crc32Array (a,from,to) {
        if(typeof from === "undefined") { from = 0; }
        if(typeof to === "undefined") { to = a.length; }
        var table = [0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
                     0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91, 
                     0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
                     0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5, 
                     0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 
                     0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 
                     0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
                     0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
                     0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
                     0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01, 
                     0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 
                     0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65, 
                     0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 
                     0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9, 
                     0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 
                     0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 
                     0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 
                     0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 
                     0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 
                     0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5, 
                     0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 
                     0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79, 
                     0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 
                     0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D, 
                     0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 
                     0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 
                     0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 
                     0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 
                     0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 
                     0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9, 
                     0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 
                     0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D];
     
        var crc = -1, y = 0, n = a.length,i;

        for (i = from; i < to; i++) {
            y = (crc ^ a[i]) & 0xFF;
            crc = (crc >>> 8) ^ table[y];
        }
     
        return crc ^ (-1);
    }

    var h = img[0].length, w = img[0][0].length, s1, s2, next,k,length,a,b,i,j,adler32,crc32;
    var stream = [
                  137, 80, 78, 71, 13, 10, 26, 10,                           //  0: PNG signature
                  0,0,0,13,                                                  //  8: IHDR Chunk length
                  73, 72, 68, 82,                                            // 12: "IHDR" 
                  (w >> 24) & 255, (w >> 16) & 255, (w >> 8) & 255, w&255,   // 16: Width
                  (h >> 24) & 255, (h >> 16) & 255, (h >> 8) & 255, h&255,   // 20: Height
                  8,                                                         // 24: bit depth
                  2,                                                         // 25: RGB
                  0,                                                         // 26: deflate
                  0,                                                         // 27: no filter
                  0,                                                         // 28: no interlace
                  -1,-2,-3,-4,                                               // 29: CRC
                  -5,-6,-7,-8,                                               // 33: IDAT Chunk length
                  73, 68, 65, 84,                                            // 37: "IDAT"
                  // RFC 1950 header starts here
                  8,                                                         // 41: RFC1950 CMF
                  29                                                         // 42: RFC1950 FLG
                  ];
    crc32 = crc32Array(stream,12,29);
    stream[29] = (crc32>>24)&255;
    stream[30] = (crc32>>16)&255;
    stream[31] = (crc32>>8)&255;
    stream[32] = (crc32)&255;
    s1 = 1;
    s2 = 0;
    for(i=0;i<h;i++) {
        if(i<h-1) { stream.push(0); }
        else { stream.push(1); }
        a = (3*w+1+(i===0))&255; b = ((3*w+1+(i===0))>>8)&255;
        stream.push(a); stream.push(b);
        stream.push((~a)&255); stream.push((~b)&255);
        if(i===0) stream.push(0);
        for(j=0;j<w;j++) {
            for(k=0;k<3;k++) {
                a = img[k][i][j];
                if(a>255) a = 255;
                else if(a<0) a=0;
                else a = Math.round(a);
                s1 = (s1 + a )%65521;
                s2 = (s2 + s1)%65521;
                stream.push(a);
            }
        }
        stream.push(0);
    }
    adler32 = (s2<<16)+s1;
    stream.push((adler32>>24)&255);
    stream.push((adler32>>16)&255);
    stream.push((adler32>>8)&255);
    stream.push((adler32)&255);
    length = stream.length - 41;
    stream[33] = (length>>24)&255;
    stream[34] = (length>>16)&255;
    stream[35] = (length>>8)&255;
    stream[36] = (length)&255;
    crc32 = crc32Array(stream,37);
    stream.push((crc32>>24)&255);
    stream.push((crc32>>16)&255);
    stream.push((crc32>>8)&255);
    stream.push((crc32)&255);
    stream.push(0);
    stream.push(0);
    stream.push(0);
    stream.push(0);
//    a = stream.length;
    stream.push(73);  // I
    stream.push(69);  // E
    stream.push(78);  // N
    stream.push(68);  // D
    stream.push(174); // CRC1
    stream.push(66);  // CRC2
    stream.push(96);  // CRC3
    stream.push(130); // CRC4
    return 'data:image/png;base64,'+base64(stream);
}

// 2. Linear algebra with Arrays.
numeric._dim = function _dim(x) {
    var ret = [];
    while(typeof x === "object") { ret.push(x.length); x = x[0]; }
    return ret;
}

numeric.dim = function dim(x) {
    var y,z;
    if(typeof x === "object") {
        y = x[0];
        if(typeof y === "object") {
            z = y[0];
            if(typeof z === "object") {
                return numeric._dim(x);
            }
            return [x.length,y.length];
        }
        return [x.length];
    }
    return [];
}

numeric.mapreduce = function mapreduce(body,init) {
    return Function('x','accum','_s','_k',
            'if(typeof accum === "undefined") accum = '+init+';\n'+
            'if(typeof x === "number") { var xi = x; '+body+'; return accum; }\n'+
            'if(typeof _s === "undefined") _s = numeric.dim(x);\n'+
            'if(typeof _k === "undefined") _k = 0;\n'+
            'var _n = _s[_k];\n'+
            'var i,xi;\n'+
            'if(_k < _s.length-1) {\n'+
            '    for(i=_n-1;i>=0;i--) {\n'+
            '        accum = arguments.callee(x[i],accum,_s,_k+1);\n'+
            '    }'+
            '    return accum;\n'+
            '}\n'+
            'for(i=_n-1;i>=1;i-=2) { \n'+
            '    xi = x[i];\n'+
            '    '+body+';\n'+
            '    xi = x[i-1];\n'+
            '    '+body+';\n'+
            '}\n'+
            'if(i === 0) {\n'+
            '    xi = x[i];\n'+
            '    '+body+'\n'+
            '}\n'+
            'return accum;'
            );
}
numeric.mapreduce2 = function mapreduce2(body,setup) {
    return Function('x',
            'var n = x.length;\n'+
            'var i,xi;\n'+setup+';\n'+
            'for(i=n-1;i!==-1;--i) { \n'+
            '    xi = x[i];\n'+
            '    '+body+';\n'+
            '}\n'+
            'return accum;'
            );
}


numeric.same = function same(x,y) {
    var i,n;
    if(!(x instanceof Array) || !(y instanceof Array)) { return false; }
    n = x.length;
    if(n !== y.length) { return false; }
    for(i=0;i<n;i++) {
        if(x[i] === y[i]) { continue; }
        if(typeof x[i] === "object") { if(!same(x[i],y[i])) return false; }
        else { return false; }
    }
    return true;
}

numeric.rep = function rep(s,v,k) {
    if(typeof k === "undefined") { k=0; }
    var n = s[k], ret = Array(n), i;
    if(k === s.length-1) {
        for(i=n-2;i>=0;i-=2) { ret[i+1] = v; ret[i] = v; }
        if(i===-1) { ret[0] = v; }
        return ret;
    }
    for(i=n-1;i>=0;i--) { ret[i] = numeric.rep(s,v,k+1); }
    return ret;
}


numeric.dotMMsmall = function dotMMsmall(x,y) {
    var i,j,k,p,q,r,ret,foo,bar,woo,i0,k0,p0,r0;
    p = x.length; q = y.length; r = y[0].length;
    ret = Array(p);
    for(i=p-1;i>=0;i--) {
        foo = Array(r);
        bar = x[i];
        for(k=r-1;k>=0;k--) {
            woo = bar[q-1]*y[q-1][k];
            for(j=q-2;j>=1;j-=2) {
                i0 = j-1;
                woo += bar[j]*y[j][k] + bar[i0]*y[i0][k];
            }
            if(j===0) { woo += bar[0]*y[0][k]; }
            foo[k] = woo;
        }
        ret[i] = foo;
    }
    return ret;
}
numeric._getCol = function _getCol(A,j,x) {
    var n = A.length, i;
    for(i=n-1;i>0;--i) {
        x[i] = A[i][j];
        --i;
        x[i] = A[i][j];
    }
    if(i===0) x[0] = A[0][j];
}
numeric.dotMMbig = function dotMMbig(x,y){
    var gc = numeric._getCol, p = y.length, v = Array(p);
    var m = x.length, n = y[0].length, A = new Array(m), xj;
    var VV = numeric.dotVV;
    var i,j,k,z;
    --p;
    --m;
    for(i=m;i!==-1;--i) A[i] = Array(n);
    --n;
    for(i=n;i!==-1;--i) {
        gc(y,i,v);
        for(j=m;j!==-1;--j) {
            z=0;
            xj = x[j];
            A[j][i] = VV(xj,v);
        }
    }
    return A;
}

numeric.dotMV = function dotMV(x,y) {
    var p = x.length, q = y.length,i;
    var ret = Array(p), dotVV = numeric.dotVV;
    for(i=p-1;i>=0;i--) { ret[i] = dotVV(x[i],y); }
    return ret;
}

numeric.dotVM = function dotVM(x,y) {
    var i,j,k,p,q,r,ret,foo,bar,woo,i0,k0,p0,r0,s1,s2,s3,baz,accum;
    p = x.length; q = y[0].length;
    ret = Array(q);
    for(k=q-1;k>=0;k--) {
        woo = x[p-1]*y[p-1][k];
        for(j=p-2;j>=1;j-=2) {
            i0 = j-1;
            woo += x[j]*y[j][k] + x[i0]*y[i0][k];
        }
        if(j===0) { woo += x[0]*y[0][k]; }
        ret[k] = woo;
    }
    return ret;
}

numeric.dotVV = function dotVV(x,y) {
    var i,n=x.length,i1,ret = x[n-1]*y[n-1];
    for(i=n-2;i>=1;i-=2) {
        i1 = i-1;
        ret += x[i]*y[i] + x[i1]*y[i1];
    }
    if(i===0) { ret += x[0]*y[0]; }
    return ret;
}

numeric.dot = function dot(x,y) {
    var d = numeric.dim;
    switch(d(x).length*1000+d(y).length) {
    case 2002:
        if(y.length < 10) return numeric.dotMMsmall(x,y);
        else return numeric.dotMMbig(x,y);
    case 2001: return numeric.dotMV(x,y);
    case 1002: return numeric.dotVM(x,y);
    case 1001: return numeric.dotVV(x,y);
    case 1000: return numeric.mulVS(x,y);
    case 1: return numeric.mulSV(x,y);
    case 0: return x*y;
    default: throw new Error('numeric.dot only works on vectors and matrices');
    }
}

numeric.diag = function diag(d) {
    var i,i1,j,n = d.length, A = Array(n), Ai;
    for(i=n-1;i>=0;i--) {
        Ai = Array(n);
        i1 = i+2;
        for(j=n-1;j>=i1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j>i) { Ai[j] = 0; }
        Ai[i] = d[i];
        for(j=i-1;j>=1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j===0) { Ai[0] = 0; }
        A[i] = Ai;
    }
    return A;
}
numeric.getDiag = function(A) {
    var n = Math.min(A.length,A[0].length),i,ret = Array(n);
    for(i=n-1;i>=1;--i) {
        ret[i] = A[i][i];
        --i;
        ret[i] = A[i][i];
    }
    if(i===0) {
        ret[0] = A[0][0];
    }
    return ret;
}

numeric.identity = function identity(n) { return numeric.diag(numeric.rep([n],1)); }
numeric.pointwise = function pointwise(params,body,setup) {
    if(typeof setup === "undefined") { setup = ""; }
    var fun = [];
    var k;
    var avec = /\[i\]$/,p,thevec = '';
    var haveret = false;
    for(k=0;k<params.length;k++) {
        if(avec.test(params[k])) {
            p = params[k].substring(0,params[k].length-3);
            thevec = p;
        } else { p = params[k]; }
        if(p==='ret') haveret = true;
        fun.push(p);
    }
    fun[params.length] = '_s';
    fun[params.length+1] = '_k';
    fun[params.length+2] = (
            'if(typeof _s === "undefined") _s = numeric.dim('+thevec+');\n'+
            'if(typeof _k === "undefined") _k = 0;\n'+
            'var _n = _s[_k];\n'+
            'var i'+(haveret?'':', ret = Array(_n)')+';\n'+
            'if(_k < _s.length-1) {\n'+
            '    for(i=_n-1;i>=0;i--) ret[i] = arguments.callee('+params.join(',')+',_s,_k+1);\n'+
            '    return ret;\n'+
            '}\n'+
            setup+'\n'+
            'for(i=_n-1;i!==-1;--i) {\n'+
            '    '+body+'\n'+
            '}\n'+
            'return ret;'
            );
    return Function.apply(null,fun);
}
numeric.pointwise2 = function pointwise2(params,body,setup) {
    if(typeof setup === "undefined") { setup = ""; }
    var fun = [];
    var k;
    var avec = /\[i\]$/,p,thevec = '';
    var haveret = false;
    for(k=0;k<params.length;k++) {
        if(avec.test(params[k])) {
            p = params[k].substring(0,params[k].length-3);
            thevec = p;
        } else { p = params[k]; }
        if(p==='ret') haveret = true;
        fun.push(p);
    }
    fun[params.length] = (
            'var _n = '+thevec+'.length;\n'+
            'var i'+(haveret?'':', ret = Array(_n)')+';\n'+
            setup+'\n'+
            'for(i=_n-1;i!==-1;--i) {\n'+
            body+'\n'+
            '}\n'+
            'return ret;'
            );
    return Function.apply(null,fun);
}
numeric._biforeach = (function _biforeach(x,y,s,k,f) {
    if(k === s.length-1) { f(x,y); return; }
    var i,n=s[k];
    for(i=n-1;i>=0;i--) { _biforeach(typeof x==="object"?x[i]:x,typeof y==="object"?y[i]:y,s,k+1,f); }
});
numeric._biforeach2 = (function _biforeach2(x,y,s,k,f) {
    if(k === s.length-1) { return f(x,y); }
    var i,n=s[k],ret = Array(n);
    for(i=n-1;i>=0;--i) { ret[i] = _biforeach2(typeof x==="object"?x[i]:x,typeof y==="object"?y[i]:y,s,k+1,f); }
    return ret;
});
numeric._foreach = (function _foreach(x,s,k,f) {
    if(k === s.length-1) { f(x); return; }
    var i,n=s[k];
    for(i=n-1;i>=0;i--) { _foreach(x[i],s,k+1,f); }
});
numeric._foreach2 = (function _foreach2(x,s,k,f) {
    if(k === s.length-1) { return f(x); }
    var i,n=s[k], ret = Array(n);
    for(i=n-1;i>=0;i--) { ret[i] = _foreach2(x[i],s,k+1,f); }
    return ret;
});

/*numeric.anyV = numeric.mapreduce('if(xi) return true;','false');
numeric.allV = numeric.mapreduce('if(!xi) return false;','true');
numeric.any = function(x) { if(typeof x.length === "undefined") return x; return numeric.anyV(x); }
numeric.all = function(x) { if(typeof x.length === "undefined") return x; return numeric.allV(x); }*/

numeric.ops2 = {
        add: '+',
        sub: '-',
        mul: '*',
        div: '/',
        mod: '%',
        and: '&&',
        or:  '||',
        eq:  '===',
        neq: '!==',
        lt:  '<',
        gt:  '>',
        leq: '<=',
        geq: '>=',
        band: '&',
        bor: '|',
        bxor: '^',
        lshift: '<<',
        rshift: '>>',
        rrshift: '>>>'
};
numeric.opseq = {
        addeq: '+=',
        subeq: '-=',
        muleq: '*=',
        diveq: '/=',
        modeq: '%=',
        lshifteq: '<<=',
        rshifteq: '>>=',
        rrshifteq: '>>>=',
        bandeq: '&=',
        boreq: '|=',
        bxoreq: '^='
};
numeric.mathfuns = ['abs','acos','asin','atan','ceil','cos',
                    'exp','floor','log','round','sin','sqrt','tan',
                    'isNaN','isFinite'];
numeric.mathfuns2 = ['atan2','pow','max','min'];
numeric.ops1 = {
        neg: '-',
        not: '!',
        bnot: '~',
        clone: ''
};
numeric.mapreducers = {
        any: ['if(xi) return true;','var accum = false;'],
        all: ['if(!xi) return false;','var accum = true;'],
        sum: ['accum += xi;','var accum = 0;'],
        prod: ['accum *= xi;','var accum = 1;'],
        norm2Squared: ['accum += xi*xi;','var accum = 0;'],
        norminf: ['accum = max(accum,abs(xi));','var accum = 0, max = Math.max, abs = Math.abs;'],
        norm1: ['accum += abs(xi)','var accum = 0, abs = Math.abs;'],
        sup: ['accum = max(accum,xi);','var accum = -Infinity, max = Math.max;'],
        inf: ['accum = min(accum,xi);','var accum = Infinity, min = Math.min;']
};

(function () {
    var i,o;
    for(i=0;i<numeric.mathfuns2.length;++i) {
        o = numeric.mathfuns2[i];
        numeric.ops2[o] = o;
    }
    for(i in numeric.ops2) {
        if(numeric.ops2.hasOwnProperty(i)) {
            o = numeric.ops2[i];
            var code, codeeq, setup = '';
            if(numeric.myIndexOf.call(numeric.mathfuns2,i)!==-1) {
                setup = 'var '+o+' = Math.'+o+';\n';
                code = function(r,x,y) { return r+' = '+o+'('+x+','+y+')'; };
                codeeq = function(x,y) { return x+' = '+o+'('+x+','+y+')'; };
            } else {
                code = function(r,x,y) { return r+' = '+x+' '+o+' '+y; };
                if(numeric.opseq.hasOwnProperty(i+'eq')) {
                    codeeq = function(x,y) { return x+' '+o+'= '+y; };
                } else {
                    codeeq = function(x,y) { return x+' = '+x+' '+o+' '+y; };                    
                }
            }
            numeric[i+'VV'] = numeric.pointwise2(['x[i]','y[i]'],code('ret[i]','x[i]','y[i]'),setup);
            numeric[i+'SV'] = numeric.pointwise2(['x','y[i]'],code('ret[i]','x','y[i]'),setup);
            numeric[i+'VS'] = numeric.pointwise2(['x[i]','y'],code('ret[i]','x[i]','y'),setup);
            numeric[i] = Function(
                    'var n = arguments.length, i, x = arguments[0], y;\n'+
                    'var VV = numeric.'+i+'VV, VS = numeric.'+i+'VS, SV = numeric.'+i+'SV;\n'+
                    'var dim = numeric.dim;\n'+
                    'for(i=1;i!==n;++i) { \n'+
                    '  y = arguments[i];\n'+
                    '  if(typeof x === "object") {\n'+
                    '      if(typeof y === "object") x = numeric._biforeach2(x,y,dim(x),0,VV);\n'+
                    '      else x = numeric._biforeach2(x,y,dim(x),0,VS);\n'+
                    '  } else if(typeof y === "object") x = numeric._biforeach2(x,y,dim(y),0,SV);\n'+
                    '  else '+codeeq('x','y')+'\n'+
                    '}\nreturn x;\n');
            numeric[o] = numeric[i];
            numeric[i+'eqV'] = numeric.pointwise2(['ret[i]','x[i]'], codeeq('ret[i]','x[i]'),setup);
            numeric[i+'eqS'] = numeric.pointwise2(['ret[i]','x'], codeeq('ret[i]','x'),setup);
            numeric[i+'eq'] = Function(
                    'var n = arguments.length, i, x = arguments[0], y;\n'+
                    'var V = numeric.'+i+'eqV, S = numeric.'+i+'eqS\n'+
                    'var s = numeric.dim(x);\n'+
                    'for(i=1;i!==n;++i) { \n'+
                    '  y = arguments[i];\n'+
                    '  if(typeof y === "object") numeric._biforeach(x,y,s,0,V);\n'+
                    '  else numeric._biforeach(x,y,s,0,S);\n'+
                    '}\nreturn x;\n');
        }
    }
    for(i=0;i<numeric.mathfuns2.length;++i) {
        o = numeric.mathfuns2[i];
        delete numeric.ops2[o];
    }
    for(i=0;i<numeric.mathfuns.length;++i) {
        o = numeric.mathfuns[i];
        numeric.ops1[o] = o;
    }
    for(i in numeric.ops1) {
        if(numeric.ops1.hasOwnProperty(i)) {
            setup = '';
            o = numeric.ops1[i];
            if(numeric.myIndexOf.call(numeric.mathfuns,i)!==-1) {
                if(Math.hasOwnProperty(o)) setup = 'var '+o+' = Math.'+o+';\n';
            }
            numeric[i+'eqV'] = numeric.pointwise2(['ret[i]'],'ret[i] = '+o+'(ret[i]);',setup);
            numeric[i+'eq'] = Function('x',
                    'if(typeof x !== "object") return '+o+'x\n'+
                    'var i;\n'+
                    'var V = numeric.'+i+'eqV;\n'+
                    'var s = numeric.dim(x);\n'+
                    'numeric._foreach(x,s,0,V);\n'+
                    'return x;\n');
            numeric[i+'V'] = numeric.pointwise2(['x[i]'],'ret[i] = '+o+'(x[i]);',setup);
            numeric[i] = Function('x',
                    'if(typeof x !== "object") return '+o+'(x)\n'+
                    'var i;\n'+
                    'var V = numeric.'+i+'V;\n'+
                    'var s = numeric.dim(x);\n'+
                    'return numeric._foreach2(x,s,0,V);\n');
        }
    }
    for(i=0;i<numeric.mathfuns.length;++i) {
        o = numeric.mathfuns[i];
        delete numeric.ops1[o];
    }
    for(i in numeric.mapreducers) {
        if(numeric.mapreducers.hasOwnProperty(i)) {
            o = numeric.mapreducers[i];
            numeric[i+'V'] = numeric.mapreduce2(o[0],o[1]);
            numeric[i] = Function('x','s','k',
                    o[1]+
                    'if(typeof x !== "object") {'+
                    '    xi = x;\n'+
                    o[0]+';\n'+
                    '    return accum;\n'+
                    '}'+
                    'if(typeof s === "undefined") s = numeric.dim(x);\n'+
                    'if(typeof k === "undefined") k = 0;\n'+
                    'if(k === s.length-1) return numeric.'+i+'V(x);\n'+
                    'var xi;\n'+
                    'var n = x.length, i;\n'+
                    'for(i=n-1;i!==-1;--i) {\n'+
                    '   xi = arguments.callee(x[i]);\n'+
                    o[0]+';\n'+
                    '}\n'+
                    'return accum;\n');
        }
    }
}());

numeric.truncVV = numeric.pointwise(['x[i]','y[i]'],'ret[i] = round(x[i]/y[i])*y[i];','var round = Math.round;');
numeric.truncVS = numeric.pointwise(['x[i]','y'],'ret[i] = round(x[i]/y)*y;','var round = Math.round;');
numeric.truncSV = numeric.pointwise(['x','y[i]'],'ret[i] = round(x/y[i])*y[i];','var round = Math.round;');
numeric.trunc = function trunc(x,y) {
    if(typeof x === "object") {
        if(typeof y === "object") return numeric.truncVV(x,y);
        return numeric.truncVS(x,y);
    }
    if (typeof y === "object") return numeric.truncSV(x,y);
    return Math.round(x/y)*y;
}

numeric.inv = function inv(x) {
    var s = numeric.dim(x), abs = Math.abs, m = s[0], n = s[1];
    var A = numeric.clone(x), Ai, Aj;
    var I = numeric.identity(m), Ii, Ij;
    var i,j,k,x;
    for(j=0;j<n;++j) {
        var i0 = -1;
        var v0 = -1;
        for(i=j;i!==m;++i) { k = abs(A[i][j]); if(k>v0) { i0 = i; v0 = k; } }
        Aj = A[i0]; A[i0] = A[j]; A[j] = Aj;
        Ij = I[i0]; I[i0] = I[j]; I[j] = Ij;
        x = Aj[j];
        for(k=j;k!==n;++k)    Aj[k] /= x; 
        for(k=n-1;k!==-1;--k) Ij[k] /= x;
        for(i=m-1;i!==-1;--i) {
            if(i!==j) {
                Ai = A[i];
                Ii = I[i];
                x = Ai[j];
                for(k=j+1;k!==n;++k)  Ai[k] -= Aj[k]*x;
                for(k=n-1;k>0;--k) { Ii[k] -= Ij[k]*x; --k; Ii[k] -= Ij[k]*x; }
                if(k===0) Ii[0] -= Ij[0]*x;
            }
        }
    }
    return I;
}

numeric.det = function det(x) {
    var s = numeric.dim(x);
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: det() only works on square matrices'); }
    var n = s[0], ret = 1,i,j,k,A = numeric.clone(x),Aj,Ai,alpha,temp,k1,k2,k3;
    for(j=0;j<n-1;j++) {
        k=j;
        for(i=j+1;i<n;i++) { if(Math.abs(A[i][j]) > Math.abs(A[k][j])) { k = i; } }
        if(k !== j) {
            temp = A[k]; A[k] = A[j]; A[j] = temp;
            ret *= -1;
        }
        Aj = A[j];
        for(i=j+1;i<n;i++) {
            Ai = A[i];
            alpha = Ai[j]/Aj[j];
            for(k=j+1;k<n-1;k+=2) {
                k1 = k+1;
                Ai[k] -= Aj[k]*alpha;
                Ai[k1] -= Aj[k1]*alpha;
            }
            if(k!==n) { Ai[k] -= Aj[k]*alpha; }
        }
        if(Aj[j] === 0) { return 0; }
        ret *= Aj[j];
    }
    return ret*A[j][j];
}

numeric.transpose = function transpose(x) {
    var i,j,m = x.length,n = x[0].length, ret=Array(n),A0,A1,Bj;
    for(j=0;j<n;j++) ret[j] = Array(m);
    for(i=m-1;i>=1;i-=2) {
        A1 = x[i];
        A0 = x[i-1];
        for(j=n-1;j>=1;--j) {
            Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
            --j;
            Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
        }
        if(j===0) {
            Bj = ret[0]; Bj[i] = A1[0]; Bj[i-1] = A0[0];
        }
    }
    if(i===0) {
        A0 = x[0];
        for(j=n-1;j>=1;--j) {
            ret[j][0] = A0[j];
            --j;
            ret[j][0] = A0[j];
        }
        if(j===0) { ret[0][0] = A0[0]; }
    }
    return ret;
}
numeric.negtranspose = function negtranspose(x) {
    var i,j,m = x.length,n = x[0].length, ret=Array(n),A0,A1,Bj;
    for(j=0;j<n;j++) ret[j] = Array(m);
    for(i=m-1;i>=1;i-=2) {
        A1 = x[i];
        A0 = x[i-1];
        for(j=n-1;j>=1;--j) {
            Bj = ret[j]; Bj[i] = -A1[j]; Bj[i-1] = -A0[j];
            --j;
            Bj = ret[j]; Bj[i] = -A1[j]; Bj[i-1] = -A0[j];
        }
        if(j===0) {
            Bj = ret[0]; Bj[i] = -A1[0]; Bj[i-1] = -A0[0];
        }
    }
    if(i===0) {
        A0 = x[0];
        for(j=n-1;j>=1;--j) {
            ret[j][0] = -A0[j];
            --j;
            ret[j][0] = -A0[j];
        }
        if(j===0) { ret[0][0] = -A0[0]; }
    }
    return ret;
}

numeric._random = function _random(s,k) {
    var i,n=s[k],ret=Array(n), rnd;
    if(k === s.length-1) {
        rnd = Math.random;
        for(i=n-1;i>=1;i-=2) {
            ret[i] = rnd();
            ret[i-1] = rnd();
        }
        if(i===0) { ret[0] = rnd(); }
        return ret;
    }
    for(i=n-1;i>=0;i--) ret[i] = _random(s,k+1);
    return ret;
}
numeric.random = function random(s) { return numeric._random(s,0); }

numeric.norm2 = function norm2(x) { return Math.sqrt(numeric.norm2Squared(x)); }

numeric.linspace = function linspace(a,b,n) {
    if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
    if(n<2) { return n===1?[a]:[]; }
    var i,ret = Array(n);
    n--;
    for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
    return ret;
}

numeric.getBlock = function getBlock(x,from,to) {
    var s = numeric.dim(x);
    function foo(x,k) {
        var i,a = from[k], n = to[k]-a, ret = Array(n);
        if(k === s.length-1) {
            for(i=n;i>=0;i--) { ret[i] = x[i+a]; }
            return ret;
        }
        for(i=n;i>=0;i--) { ret[i] = foo(x[i+a],k+1); }
        return ret;
    }
    return foo(x,0);
}

numeric.setBlock = function setBlock(x,from,to,B) {
    var s = numeric.dim(x);
    function foo(x,y,k) {
        var i,a = from[k], n = to[k]-a;
        if(k === s.length-1) { for(i=n;i>=0;i--) { x[i+a] = y[i]; } }
        for(i=n;i>=0;i--) { foo(x[i+a],y[i],k+1); }
    }
    foo(x,B,0);
    return x;
}

numeric.getRange = function getRange(A,I,J) {
    var m = I.length, n = J.length;
    var i,j;
    var B = Array(m), Bi, AI;
    for(i=m-1;i!==-1;--i) {
        B[i] = Array(n);
        Bi = B[i];
        AI = A[I[i]];
        for(j=n-1;j!==-1;--j) Bi[j] = AI[J[j]];
    }
    return B;
}

numeric.blockMatrix = function blockMatrix(X) {
    var s = numeric.dim(X);
    if(s.length<4) return numeric.blockMatrix([X]);
    var m=s[0],n=s[1],M,N,i,j,Xij;
    M = 0; N = 0;
    for(i=0;i<m;++i) M+=X[i][0].length;
    for(j=0;j<n;++j) N+=X[0][j][0].length;
    var Z = Array(M);
    for(i=0;i<M;++i) Z[i] = Array(N);
    var I=0,J,ZI,k,l,Xijk;
    for(i=0;i<m;++i) {
        J=N;
        for(j=n-1;j!==-1;--j) {
            Xij = X[i][j];
            J -= Xij[0].length;
            for(k=Xij.length-1;k!==-1;--k) {
                Xijk = Xij[k];
                ZI = Z[I+k];
                for(l = Xijk.length-1;l!==-1;--l) ZI[J+l] = Xijk[l];
            }
        }
        I += X[i][0].length;
    }
    return Z;
}

numeric.tensor = function tensor(x,y) {
    if(typeof x === "number" || typeof y === "number") return numeric.mul(x,y);
    var s1 = numeric.dim(x), s2 = numeric.dim(y);
    if(s1.length !== 1 || s2.length !== 1) {
        throw new Error('numeric: tensor product is only defined for vectors');
    }
    var m = s1[0], n = s2[0], A = Array(m), Ai, i,j,xi;
    for(i=m-1;i>=0;i--) {
        Ai = Array(n);
        xi = x[i];
        for(j=n-1;j>=3;--j) {
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
        }
        while(j>=0) { Ai[j] = xi * y[j]; --j; }
        A[i] = Ai;
    }
    return A;
}

// 3. The Tensor type T
numeric.T = function T(x,y) { this.x = x; this.y = y; }
numeric.t = function t(x,y) { return new numeric.T(x,y); }

numeric.Tbinop = function Tbinop(rr,rc,cr,cc,setup) {
    var io = numeric.indexOf;
    if(typeof setup !== "string") {
        var k;
        setup = '';
        for(k in numeric) {
            if(numeric.hasOwnProperty(k) && (rr.indexOf(k)>=0 || rc.indexOf(k)>=0 || cr.indexOf(k)>=0 || cc.indexOf(k)>=0) && k.length>1) {
                setup += 'var '+k+' = numeric.'+k+';\n';
            }
        }
    }
    return Function(['y'],
            'var x = this;\n'+
            'if(!(y instanceof numeric.T)) { y = new numeric.T(y); }\n'+
            setup+'\n'+
            'if(x.y) {'+
            '  if(y.y) {'+
            '    return new numeric.T('+cc+');\n'+
            '  }\n'+
            '  return new numeric.T('+cr+');\n'+
            '}\n'+
            'if(y.y) {\n'+
            '  return new numeric.T('+rc+');\n'+
            '}\n'+
            'return new numeric.T('+rr+');\n'
    );
}

numeric.T.prototype.add = numeric.Tbinop(
        'add(x.x,y.x)',
        'add(x.x,y.x),y.y',
        'add(x.x,y.x),x.y',
        'add(x.x,y.x),add(x.y,y.y)');
numeric.T.prototype.sub = numeric.Tbinop(
        'sub(x.x,y.x)',
        'sub(x.x,y.x),neg(y.y)',
        'sub(x.x,y.x),x.y',
        'sub(x.x,y.x),sub(x.y,y.y)');
numeric.T.prototype.mul = numeric.Tbinop(
        'mul(x.x,y.x)',
        'mul(x.x,y.x),mul(x.x,y.y)',
        'mul(x.x,y.x),mul(x.y,y.x)',
        'sub(mul(x.x,y.x),mul(x.y,y.y)),add(mul(x.x,y.y),mul(x.y,y.x))');

numeric.T.prototype.reciprocal = function reciprocal() {
    var mul = numeric.mul, div = numeric.div;
    if(this.y) {
        var d = numeric.add(mul(this.x,this.x),mul(this.y,this.y));
        return new numeric.T(div(this.x,d),div(numeric.neg(this.y),d));
    }
    return new T(div(1,this.x));
}
numeric.T.prototype.div = function div(y) {
    if(!(y instanceof numeric.T)) y = new numeric.T(y);
    if(y.y) { return this.mul(y.reciprocal()); }
    var div = numeric.div;
    if(this.y) { return new numeric.T(div(this.x,y.x),div(this.y,y.x)); }
    return new numeric.T(div(this.x,y.x));
}
numeric.T.prototype.dot = numeric.Tbinop(
        'dot(x.x,y.x)',
        'dot(x.x,y.x),dot(x.x,y.y)',
        'dot(x.x,y.x),dot(x.y,y.x)',
        'sub(dot(x.x,y.x),dot(x.y,y.y)),add(dot(x.x,y.y),dot(x.y,y.x))'
        );
numeric.T.prototype.transpose = function transpose() {
    var t = numeric.transpose, x = this.x, y = this.y;
    if(y) { return new numeric.T(t(x),t(y)); }
    return new numeric.T(t(x));
}
numeric.T.prototype.transjugate = function transjugate() {
    var t = numeric.transpose, x = this.x, y = this.y;
    if(y) { return new numeric.T(t(x),numeric.negtranspose(y)); }
    return new numeric.T(t(x));
}
numeric.Tunop = function Tunop(r,c,s) {
    if(typeof s !== "string") { s = ''; }
    return Function(
            'var x = this;\n'+
            s+'\n'+
            'if(x.y) {'+
            '  '+c+';\n'+
            '}\n'+
            r+';\n'
    );
}

numeric.T.prototype.exp = numeric.Tunop(
        'return new numeric.T(ex)',
        'return new numeric.T(mul(cos(x.y),ex),mul(sin(x.y),ex))',
        'var ex = numeric.exp(x.x), cos = numeric.cos, sin = numeric.sin, mul = numeric.mul;');
numeric.T.prototype.conj = numeric.Tunop(
        'return new numeric.T(x.x);',
        'return new numeric.T(x.x,numeric.neg(x.y));');
numeric.T.prototype.neg = numeric.Tunop(
        'return new numeric.T(neg(x.x));',
        'return new numeric.T(neg(x.x),neg(x.y));',
        'var neg = numeric.neg;');
numeric.T.prototype.sin = numeric.Tunop(
        'return new numeric.T(numeric.sin(x.x))',
        'return x.exp().sub(x.neg().exp()).div(new numeric.T(0,2));');
numeric.T.prototype.cos = numeric.Tunop(
        'return new numeric.T(numeric.cos(x.x))',
        'return x.exp().add(x.neg().exp()).div(2);');
numeric.T.prototype.abs = numeric.Tunop(
        'return new numeric.T(numeric.abs(x.x));',
        'return new numeric.T(numeric.sqrt(numeric.add(mul(x.x,x.x),mul(x.y,x.y))));',
        'var mul = numeric.mul;');
numeric.T.prototype.log = numeric.Tunop(
        'return new numeric.T(numeric.log(x.x));',
        'var theta = new numeric.T(numeric.atan2(x.y,x.x)), r = x.abs();\n'+
        'return new numeric.T(numeric.log(r.x),theta.x);');
numeric.T.prototype.norm2 = numeric.Tunop(
        'return numeric.norm2(x.x);',
        'var f = numeric.norm2Squared;\n'+
        'return Math.sqrt(f(x.x)+f(x.y));');
numeric.T.prototype.inv = function inv() {
    var A = this;
    if(typeof A.y === "undefined") { return new numeric.T(numeric.inv(A.x)); }
    var n = A.x.length, i, j, k;
    var Rx = numeric.identity(n),Ry = numeric.rep([n,n],0);
    var Ax = numeric.clone(A.x), Ay = numeric.clone(A.y);
    var Aix, Aiy, Ajx, Ajy, Rix, Riy, Rjx, Rjy;
    var i,j,k,d,d1,ax,ay,bx,by,temp;
    for(i=0;i<n;i++) {
        ax = Ax[i][i]; ay = Ay[i][i];
        d = ax*ax+ay*ay;
        k = i;
        for(j=i+1;j<n;j++) {
            ax = Ax[j][i]; ay = Ay[j][i];
            d1 = ax*ax+ay*ay;
            if(d1 > d) { k=j; d = d1; }
        }
        if(k!==i) {
            temp = Ax[i]; Ax[i] = Ax[k]; Ax[k] = temp;
            temp = Ay[i]; Ay[i] = Ay[k]; Ay[k] = temp;
            temp = Rx[i]; Rx[i] = Rx[k]; Rx[k] = temp;
            temp = Ry[i]; Ry[i] = Ry[k]; Ry[k] = temp;
        }
        Aix = Ax[i]; Aiy = Ay[i];
        Rix = Rx[i]; Riy = Ry[i];
        ax = Aix[i]; ay = Aiy[i];
        for(j=i+1;j<n;j++) {
            bx = Aix[j]; by = Aiy[j];
            Aix[j] = (bx*ax+by*ay)/d;
            Aiy[j] = (by*ax-bx*ay)/d;
        }
        for(j=0;j<n;j++) {
            bx = Rix[j]; by = Riy[j];
            Rix[j] = (bx*ax+by*ay)/d;
            Riy[j] = (by*ax-bx*ay)/d;
        }
        for(j=i+1;j<n;j++) {
            Ajx = Ax[j]; Ajy = Ay[j];
            Rjx = Rx[j]; Rjy = Ry[j];
            ax = Ajx[i]; ay = Ajy[i];
            for(k=i+1;k<n;k++) {
                bx = Aix[k]; by = Aiy[k];
                Ajx[k] -= bx*ax-by*ay;
                Ajy[k] -= by*ax+bx*ay;
            }
            for(k=0;k<n;k++) {
                bx = Rix[k]; by = Riy[k];
                Rjx[k] -= bx*ax-by*ay;
                Rjy[k] -= by*ax+bx*ay;
            }
        }
    }
    for(i=n-1;i>0;i--) {
        Rix = Rx[i]; Riy = Ry[i];
        for(j=i-1;j>=0;j--) {
            Rjx = Rx[j]; Rjy = Ry[j];
            ax = Ax[j][i]; ay = Ay[j][i];
            for(k=n-1;k>=0;k--) {
                bx = Rix[k]; by = Riy[k];
                Rjx[k] -= ax*bx - ay*by;
                Rjy[k] -= ax*by + ay*bx;
            }
        }
    }
    return new numeric.T(Rx,Ry);
}
numeric.T.prototype.get = function get(i) {
    var x = this.x, y = this.y, k = 0, ik, n = i.length;
    if(y) {
        while(k<n) {
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        return new numeric.T(x,y);
    }
    while(k<n) {
        ik = i[k];
        x = x[ik];
        k++;
    }
    return new numeric.T(x);
}
numeric.T.prototype.set = function set(i,v) {
    var x = this.x, y = this.y, k = 0, ik, n = i.length, vx = v.x, vy = v.y;
    if(n===0) {
        if(vy) { this.y = vy; }
        else if(y) { this.y = undefined; }
        this.x = x;
        return this;
    }
    if(vy) {
        if(y) { /* ok */ }
        else {
            y = numeric.rep(numeric.dim(x),0);
            this.y = y;
        }
        while(k<n-1) {
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        ik = i[k];
        x[ik] = vx;
        y[ik] = vy;
        return this;
    }
    if(y) {
        while(k<n-1) {
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        ik = i[k];
        x[ik] = vx;
        if(vx instanceof Array) y[ik] = numeric.rep(numeric.dim(vx),0);
        else y[ik] = 0;
        return this;
    }
    while(k<n-1) {
        ik = i[k];
        x = x[ik];
        k++;
    }
    ik = i[k];
    x[ik] = vx;
    return this;
}
numeric.T.prototype.getRows = function getRows(i0,i1) {
    var n = i1-i0+1, j;
    var rx = Array(n), ry, x = this.x, y = this.y;
    for(j=i0;j<=i1;j++) { rx[j-i0] = x[j]; }
    if(y) {
        ry = Array(n);
        for(j=i0;j<=i1;j++) { ry[j-i0] = y[j]; }
        return new numeric.T(rx,ry);
    }
    return new numeric.T(rx);
}
numeric.T.prototype.setRows = function setRows(i0,i1,A) {
    var j;
    var rx = this.x, ry = this.y, x = A.x, y = A.y;
    for(j=i0;j<=i1;j++) { rx[j] = x[j-i0]; }
    if(y) {
        if(!ry) { ry = numeric.rep(numeric.dim(rx),0); this.y = ry; }
        for(j=i0;j<=i1;j++) { ry[j] = y[j-i0]; }
    } else if(ry) {
        for(j=i0;j<=i1;j++) { ry[j] = numeric.rep([x[j-i0].length],0); }
    }
    return this;
}
numeric.T.prototype.getRow = function getRow(k) {
    var x = this.x, y = this.y;
    if(y) { return new numeric.T(x[k],y[k]); }
    return new numeric.T(x[k]);
}
numeric.T.prototype.setRow = function setRow(i,v) {
    var rx = this.x, ry = this.y, x = v.x, y = v.y;
    rx[i] = x;
    if(y) {
        if(!ry) { ry = numeric.rep(numeric.dim(rx),0); this.y = ry; }
        ry[i] = y;
    } else if(ry) {
        ry = numeric.rep([x.length],0);
    }
    return this;
}

numeric.T.prototype.getBlock = function getBlock(from,to) {
    var x = this.x, y = this.y, b = numeric.getBlock;
    if(y) { return new numeric.T(b(x,from,to),b(y,from,to)); }
    return new numeric.T(b(x,from,to));
}
numeric.T.prototype.setBlock = function setBlock(from,to,A) {
    if(!(A instanceof numeric.T)) A = new numeric.T(A);
    var x = this.x, y = this.y, b = numeric.setBlock, Ax = A.x, Ay = A.y;
    if(Ay) {
        if(!y) { this.y = numeric.rep(numeric.dim(this),0); y = this.y; }
        b(x,from,to,Ax);
        b(y,from,to,Ay);
        return this;
    }
    b(x,from,to,Ax);
    if(y) b(y,from,to,numeric.rep(numeric.dim(Ax),0));
}
numeric.T.rep = function rep(s,v) {
    var T = numeric.T;
    if(!(v instanceof T)) v = new T(v);
    var x = v.x, y = v.y, r = numeric.rep;
    if(y) return new T(r(s,x),r(s,y));
    return new T(r(s,x));
}
numeric.T.diag = function diag(d) {
    if(!(d instanceof numeric.T)) d = new numeric.T(d);
    var x = d.x, y = d.y, diag = numeric.diag;
    if(y) return new numeric.T(diag(x),diag(y));
    return new numeric.T(diag(x));
}
numeric.T.eig = function eig() {
    if(this.y) { throw new Error('eig: not implemented for complex matrices.'); }
    return numeric.eig(this.x);
}
numeric.T.identity = function identity(n) { return new numeric.T(numeric.identity(n)); }
numeric.T.prototype.getDiag = function getDiag() {
    var n = numeric;
    var x = this.x, y = this.y;
    if(y) { return new n.T(n.getDiag(x),n.getDiag(y)); }
    return new n.T(n.getDiag(x));
}

// 4. Eigenvalues of real matrices

numeric.house = function house(x) {
    var v = numeric.clone(x);
    var s = x[0] >= 0 ? 1 : -1;
    var alpha = s*numeric.norm2(x);
    v[0] += alpha;
    var foo = numeric.norm2(v);
    if(foo === 0) { /* this should not happen */ throw new Error('eig: internal error'); }
    return numeric.div(v,foo);
}

numeric.toUpperHessenberg = function toUpperHessenberg(me) {
    var s = numeric.dim(me);
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: toUpperHessenberg() only works on square matrices'); }
    var m = s[0], i,j,k,x,v,A = numeric.clone(me),B,C,Ai,Ci,Q = numeric.identity(m),Qi;
    for(j=0;j<m-2;j++) {
        x = Array(m-j-1);
        for(i=j+1;i<m;i++) { x[i-j-1] = A[i][j]; }
        if(numeric.norm2(x)>0) {
            v = numeric.house(x);
            B = numeric.getBlock(A,[j+1,j],[m-1,m-1]);
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<m;i++) { Ai = A[i]; Ci = C[i-j-1]; for(k=j;k<m;k++) Ai[k] -= 2*Ci[k-j]; }
            B = numeric.getBlock(A,[0,j+1],[m-1,m-1]);
            C = numeric.tensor(numeric.dot(B,v),v);
            for(i=0;i<m;i++) { Ai = A[i]; Ci = C[i]; for(k=j+1;k<m;k++) Ai[k] -= 2*Ci[k-j-1]; }
            B = Array(m-j-1);
            for(i=j+1;i<m;i++) B[i-j-1] = Q[i];
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<m;i++) { Qi = Q[i]; Ci = C[i-j-1]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        }
    }
    return {H:A, Q:Q};
}

numeric.epsilon = 2.220446049250313e-16;

numeric.QRFrancis = function(H,maxiter) {
    if(typeof maxiter === "undefined") { maxiter = 10000; }
    H = numeric.clone(H);
    var H0 = numeric.clone(H);
    var s = numeric.dim(H),m=s[0],x,v,a,b,c,d,det,tr, Hloc, Q = numeric.identity(m), Qi, Hi, B, C, Ci,i,j,k,iter;
    if(m<3) { return {Q:Q, B:[ [0,m-1] ]}; }
    var epsilon = numeric.epsilon;
    for(iter=0;iter<maxiter;iter++) {
        for(j=0;j<m-1;j++) {
            if(Math.abs(H[j+1][j]) < epsilon*(Math.abs(H[j][j])+Math.abs(H[j+1][j+1]))) {
                var QH1 = numeric.QRFrancis(numeric.getBlock(H,[0,0],[j,j]),maxiter);
                var QH2 = numeric.QRFrancis(numeric.getBlock(H,[j+1,j+1],[m-1,m-1]),maxiter);
                B = Array(j+1);
                for(i=0;i<=j;i++) { B[i] = Q[i]; }
                C = numeric.dot(QH1.Q,B);
                for(i=0;i<=j;i++) { Q[i] = C[i]; }
                B = Array(m-j-1);
                for(i=j+1;i<m;i++) { B[i-j-1] = Q[i]; }
                C = numeric.dot(QH2.Q,B);
                for(i=j+1;i<m;i++) { Q[i] = C[i-j-1]; }
                return {Q:Q,B:QH1.B.concat(numeric.add(QH2.B,j+1))};
            }
        }
        a = H[m-2][m-2]; b = H[m-2][m-1];
        c = H[m-1][m-2]; d = H[m-1][m-1];
        tr = a+d;
        det = (a*d-b*c);
        Hloc = numeric.getBlock(H, [0,0], [2,2]);
        if(tr*tr>=4*det) {
            var s1,s2;
            s1 = 0.5*(tr+Math.sqrt(tr*tr-4*det));
            s2 = 0.5*(tr-Math.sqrt(tr*tr-4*det));
            Hloc = numeric.add(numeric.sub(numeric.dot(Hloc,Hloc),
                                           numeric.mul(Hloc,s1+s2)),
                               numeric.diag(numeric.rep([3],s1*s2)));
        } else {
            Hloc = numeric.add(numeric.sub(numeric.dot(Hloc,Hloc),
                                           numeric.mul(Hloc,tr)),
                               numeric.diag(numeric.rep([3],det)));
        }
        x = [Hloc[0][0],Hloc[1][0],Hloc[2][0]];
        v = numeric.house(x);
        B = [H[0],H[1],H[2]];
        C = numeric.tensor(v,numeric.dot(v,B));
        for(i=0;i<3;i++) { Hi = H[i]; Ci = C[i]; for(k=0;k<m;k++) Hi[k] -= 2*Ci[k]; }
        B = numeric.getBlock(H, [0,0],[m-1,2]);
        C = numeric.tensor(numeric.dot(B,v),v);
        for(i=0;i<m;i++) { Hi = H[i]; Ci = C[i]; for(k=0;k<3;k++) Hi[k] -= 2*Ci[k]; }
        B = [Q[0],Q[1],Q[2]];
        C = numeric.tensor(v,numeric.dot(v,B));
        for(i=0;i<3;i++) { Qi = Q[i]; Ci = C[i]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        var J;
        for(j=0;j<m-2;j++) {
            for(k=j;k<=j+1;k++) {
                if(Math.abs(H[k+1][k]) < epsilon*(Math.abs(H[k][k])+Math.abs(H[k+1][k+1]))) {
                    var QH1 = numeric.QRFrancis(numeric.getBlock(H,[0,0],[k,k]),maxiter);
                    var QH2 = numeric.QRFrancis(numeric.getBlock(H,[k+1,k+1],[m-1,m-1]),maxiter);
                    B = Array(k+1);
                    for(i=0;i<=k;i++) { B[i] = Q[i]; }
                    C = numeric.dot(QH1.Q,B);
                    for(i=0;i<=k;i++) { Q[i] = C[i]; }
                    B = Array(m-k-1);
                    for(i=k+1;i<m;i++) { B[i-k-1] = Q[i]; }
                    C = numeric.dot(QH2.Q,B);
                    for(i=k+1;i<m;i++) { Q[i] = C[i-k-1]; }
                    return {Q:Q,B:QH1.B.concat(numeric.add(QH2.B,k+1))};
                }
            }
            J = Math.min(m-1,j+3);
            x = Array(J-j);
            for(i=j+1;i<=J;i++) { x[i-j-1] = H[i][j]; }
            v = numeric.house(x);
            B = numeric.getBlock(H, [j+1,j],[J,m-1]);
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<=J;i++) { Hi = H[i]; Ci = C[i-j-1]; for(k=j;k<m;k++) Hi[k] -= 2*Ci[k-j]; }
            B = numeric.getBlock(H, [0,j+1],[m-1,J]);
            C = numeric.tensor(numeric.dot(B,v),v);
            for(i=0;i<m;i++) { Hi = H[i]; Ci = C[i]; for(k=j+1;k<=J;k++) Hi[k] -= 2*Ci[k-j-1]; }
            B = Array(J-j);
            for(i=j+1;i<=J;i++) B[i-j-1] = Q[i];
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<=J;i++) { Qi = Q[i]; Ci = C[i-j-1]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        }
    }
    throw new Error('numeric: eigenvalue iteration does not converge -- increase maxiter?');
}

numeric.eig = function eig(A,maxiter) {
    var QH = numeric.toUpperHessenberg(A);
    var QB = numeric.QRFrancis(QH.H,maxiter);
    var T = numeric.T;
    var n = A.length,i,k,flag = false,B = QB.B,H = numeric.dot(QB.Q,numeric.dot(QH.H,numeric.transpose(QB.Q)));
    var Q = new T(numeric.dot(QB.Q,QH.Q)),Q0;
    var m = B.length,j;
    var a,b,c,d,p1,p2,disc,x,y,p,q,n1,n2;
    var sqrt = Math.sqrt;
    for(k=0;k<m;k++) {
        i = B[k][0];
        if(i === B[k][1]) {
            // nothing
        } else {
            j = i+1;
            a = H[i][i];
            b = H[i][j];
            c = H[j][i];
            d = H[j][j];
            if(b === 0 && c === 0) continue;
            p1 = -a-d;
            p2 = a*d-b*c;
            disc = p1*p1-4*p2;
            if(disc>=0) {
                if(p1<0) x = -0.5*(p1-sqrt(disc));
                else     x = -0.5*(p1+sqrt(disc));
                n1 = (a-x)*(a-x)+b*b;
                n2 = c*c+(d-x)*(d-x);
                if(n1>n2) {
                    n1 = sqrt(n1);
                    p = (a-x)/n1;
                    q = b/n1;
                } else {
                    n2 = sqrt(n2);
                    p = c/n2;
                    q = (d-x)/n2;
                }
                Q0 = new T([[q,-p],[p,q]]);
                Q.setRows(i,j,Q0.dot(Q.getRows(i,j)));
            } else {
                x = -0.5*p1;
                y = 0.5*sqrt(-disc);
                n1 = (a-x)*(a-x)+b*b;
                n2 = c*c+(d-x)*(d-x);
                if(n1>n2) {
                    n1 = sqrt(n1+y*y);
                    p = (a-x)/n1;
                    q = b/n1;
                    x = 0;
                    y /= n1;
                } else {
                    n2 = sqrt(n2+y*y);
                    p = c/n2;
                    q = (d-x)/n2;
                    x = y/n2;
                    y = 0;
                }
                Q0 = new T([[q,-p],[p,q]],[[x,y],[y,-x]]);
                Q.setRows(i,j,Q0.dot(Q.getRows(i,j)));
            }
        }
    }
    var R = Q.dot(A).dot(Q.transjugate()), n = A.length, E = numeric.T.identity(n);
    for(j=0;j<n;j++) {
        if(j>0) {
            for(k=j-1;k>=0;k--) {
                var Rk = R.get([k,k]), Rj = R.get([j,j]);
                if(numeric.neq(Rk.x,Rj.x) || numeric.neq(Rk.y,Rj.y)) {
                    x = R.getRow(k).getBlock([k],[j-1]);
                    y = E.getRow(j).getBlock([k],[j-1]);
                    E.set([j,k],(R.get([k,j]).neg().sub(x.dot(y))).div(Rk.sub(Rj)));
                } else {
                    E.setRow(j,E.getRow(k));
                    continue;
                }
            }
        }
    }
    for(j=0;j<n;j++) {
        x = E.getRow(j);
        E.setRow(j,x.div(x.norm2()));
    }
    E = E.transpose();
    E = Q.transjugate().dot(E);
    return { lambda:R.getDiag(), E:E };
};

// 5. Compressed Column Storage matrices
numeric.ccsSparse = function ccsSparse(A) {
    var m = A.length,n,foo, i,j, counts = [];
    for(i=m-1;i!==-1;--i) {
        foo = A[i];
        for(j in foo) {
            j = parseInt(j);
            while(j>=counts.length) counts[counts.length] = 0;
            if(foo[j]!==0) counts[j]++;
        }
    }
    var n = counts.length;
    var Ai = Array(n+1);
    Ai[0] = 0;
    for(i=0;i<n;++i) Ai[i+1] = Ai[i] + counts[i];
    var Aj = Array(Ai[n]), Av = Array(Ai[n]);
    for(i=m-1;i!==-1;--i) {
        foo = A[i];
        for(j in foo) {
            if(foo[j]!==0) {
                counts[j]--;
                Aj[Ai[j]+counts[j]] = i;
                Av[Ai[j]+counts[j]] = foo[j];
            }
        }
    }
    return [Ai,Aj,Av];
}
numeric.ccsFull = function ccsFull(A) {
    var Ai = A[0], Aj = A[1], Av = A[2], s = numeric.ccsDim(A), m = s[0], n = s[1], i,j,j0,j1,k;
    var B = numeric.rep([m,n],0);
    for(i=0;i<n;i++) {
        j0 = Ai[i];
        j1 = Ai[i+1];
        for(j=j0;j<j1;++j) { B[Aj[j]][i] = Av[j]; }
    }
    return B;
}
numeric.ccsTSolve = function ccsTSolve(A,b,x,bj,xj) {
    var Ai = A[0], Aj = A[1], Av = A[2],m = Ai.length-1, max = Math.max,n=0;
    if(typeof bj === "undefined") x = numeric.rep([m],0);
    if(typeof bj === "undefined") bj = numeric.linspace(0,x.length-1);
    if(typeof xj === "undefined") xj = [];
    function dfs(j) {
        var k;
        if(x[j] !== 0) return;
        x[j] = 1;
        for(k=Ai[j];k<Ai[j+1];++k) dfs(Aj[k]);
        xj[n] = j;
        ++n;
    }
    var i,j,j0,j1,k,l,l0,l1,a;
    for(i=bj.length-1;i!==-1;--i) { dfs(bj[i]); }
    xj.length = n;
    for(i=xj.length-1;i!==-1;--i) { x[xj[i]] = 0; }
    for(i=bj.length-1;i!==-1;--i) { j = bj[i]; x[j] = b[j]; }
    for(i=xj.length-1;i!==-1;--i) {
        j = xj[i];
        j0 = Ai[j];
        j1 = max(Ai[j+1],j0);
        for(k=j0;k!==j1;++k) { if(Aj[k] === j) { x[j] /= Av[k]; break; } }
        a = x[j];
        for(k=j0;k!==j1;++k) {
            l = Aj[k];
            if(l !== j) x[l] -= a*Av[k];
        }
    }
    return x;
}
numeric.ccsDFS = function ccsDFS(n) {
    this.k = Array(n);
    this.k1 = Array(n);
    this.j = Array(n);
}
numeric.ccsDFS.prototype.dfs = function dfs(J,Ai,Aj,x,xj,Pinv) {
    var m = 0,foo,n=xj.length;
    var k = this.k, k1 = this.k1, j = this.j,km,k11;
    if(x[J]!==0) return;
    x[J] = 1;
    j[0] = J;
    k[0] = km = Ai[J];
    k1[0] = k11 = Ai[J+1];
    while(1) {
        if(km >= k11) {
            xj[n] = j[m];
            if(m===0) return;
            ++n;
            --m;
            km = k[m];
            k11 = k1[m];
        } else {
            foo = Pinv[Aj[km]];
            if(x[foo] === 0) {
                x[foo] = 1;
                k[m] = km;
                ++m;
                j[m] = foo;
                km = Ai[foo];
                k1[m] = k11 = Ai[foo+1];
            } else ++km;
        }
    }
}
numeric.ccsLPSolve = function ccsLPSolve(A,B,x,xj,I,Pinv,dfs) {
    var Ai = A[0], Aj = A[1], Av = A[2],m = Ai.length-1, n=0;
    var Bi = B[0], Bj = B[1], Bv = B[2];
    
    var i,i0,i1,j,J,j0,j1,k,l,l0,l1,a;
    i0 = Bi[I];
    i1 = Bi[I+1];
    xj.length = 0;
    for(i=i0;i<i1;++i) { dfs.dfs(Pinv[Bj[i]],Ai,Aj,x,xj,Pinv); }
    for(i=xj.length-1;i!==-1;--i) { x[xj[i]] = 0; }
    for(i=i0;i!==i1;++i) { j = Pinv[Bj[i]]; x[j] = Bv[i]; }
    for(i=xj.length-1;i!==-1;--i) {
        j = xj[i];
        j0 = Ai[j];
        j1 = Ai[j+1];
        for(k=j0;k<j1;++k) { if(Pinv[Aj[k]] === j) { x[j] /= Av[k]; break; } }
        a = x[j];
        for(k=j0;k<j1;++k) {
            l = Pinv[Aj[k]];
            if(l !== j) x[l] -= a*Av[k];
        }
    }
    return x;
}
numeric.ccsLUP1 = function ccsLUP1(A,threshold) {
    var m = A[0].length-1;
    var L = [numeric.rep([m+1],0),[],[]], U = [numeric.rep([m+1], 0),[],[]];
    var Li = L[0], Lj = L[1], Lv = L[2], Ui = U[0], Uj = U[1], Uv = U[2];
    var x = numeric.rep([m],0), xj = numeric.rep([m],0);
    var i,j,k,j0,j1,a,e,c,d,K;
    var sol = numeric.ccsLPSolve, max = Math.max, abs = Math.abs;
    var P = numeric.linspace(0,m-1),Pinv = numeric.linspace(0,m-1);
    var dfs = new numeric.ccsDFS(m);
    if(typeof threshold === "undefined") { threshold = 1; }
    for(i=0;i<m;++i) {
        sol(L,A,x,xj,i,Pinv,dfs);
        a = -1;
        e = -1;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            if(k <= i) continue;
            c = abs(x[k]);
            if(c > a) { e = k; a = c; }
        }
        if(abs(x[i])<threshold*a) {
            j = P[i];
            a = P[e];
            P[i] = a; Pinv[a] = i;
            P[e] = j; Pinv[j] = e;
            a = x[i]; x[i] = x[e]; x[e] = a;
        }
        a = Li[i];
        e = Ui[i];
        d = x[i];
        Lj[a] = P[i];
        Lv[a] = 1;
        ++a;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            c = x[k];
            xj[j] = 0;
            x[k] = 0;
            if(k<=i) { Uj[e] = k; Uv[e] = c;   ++e; }
            else     { Lj[a] = P[k]; Lv[a] = c/d; ++a; }
        }
        Li[i+1] = a;
        Ui[i+1] = e;
    }
    for(j=Lj.length-1;j!==-1;--j) { Lj[j] = Pinv[Lj[j]]; }
    return {L:L, U:U, P:P, Pinv:Pinv};
}
numeric.ccsDFS0 = function ccsDFS0(n) {
    this.k = Array(n);
    this.k1 = Array(n);
    this.j = Array(n);
}
numeric.ccsDFS0.prototype.dfs = function dfs(J,Ai,Aj,x,xj,Pinv,P) {
    var m = 0,foo,n=xj.length;
    var k = this.k, k1 = this.k1, j = this.j,km,k11;
    if(x[J]!==0) return;
    x[J] = 1;
    j[0] = J;
    k[0] = km = Ai[Pinv[J]];
    k1[0] = k11 = Ai[Pinv[J]+1];
    while(1) {
        if(isNaN(km)) throw new Error("Ow!");
        if(km >= k11) {
            xj[n] = Pinv[j[m]];
            if(m===0) return;
            ++n;
            --m;
            km = k[m];
            k11 = k1[m];
        } else {
            foo = Aj[km];
            if(x[foo] === 0) {
                x[foo] = 1;
                k[m] = km;
                ++m;
                j[m] = foo;
                foo = Pinv[foo];
                km = Ai[foo];
                k1[m] = k11 = Ai[foo+1];
            } else ++km;
        }
    }
}
numeric.ccsLPSolve0 = function ccsLPSolve0(A,B,y,xj,I,Pinv,P,dfs) {
    var Ai = A[0], Aj = A[1], Av = A[2],m = Ai.length-1, n=0;
    var Bi = B[0], Bj = B[1], Bv = B[2];
    
    var i,i0,i1,j,J,j0,j1,k,l,l0,l1,a;
    i0 = Bi[I];
    i1 = Bi[I+1];
    xj.length = 0;
    for(i=i0;i<i1;++i) { dfs.dfs(Bj[i],Ai,Aj,y,xj,Pinv,P); }
    for(i=xj.length-1;i!==-1;--i) { j = xj[i]; y[P[j]] = 0; }
    for(i=i0;i!==i1;++i) { j = Bj[i]; y[j] = Bv[i]; }
    for(i=xj.length-1;i!==-1;--i) {
        j = xj[i];
        l = P[j];
        j0 = Ai[j];
        j1 = Ai[j+1];
        for(k=j0;k<j1;++k) { if(Aj[k] === l) { y[l] /= Av[k]; break; } }
        a = y[l];
        for(k=j0;k<j1;++k) y[Aj[k]] -= a*Av[k];
        y[l] = a;
    }
}
numeric.ccsLUP0 = function ccsLUP0(A,threshold) {
    var m = A[0].length-1;
    var L = [numeric.rep([m+1],0),[],[]], U = [numeric.rep([m+1], 0),[],[]];
    var Li = L[0], Lj = L[1], Lv = L[2], Ui = U[0], Uj = U[1], Uv = U[2];
    var y = numeric.rep([m],0), xj = numeric.rep([m],0);
    var i,j,k,j0,j1,a,e,c,d,K;
    var sol = numeric.ccsLPSolve0, max = Math.max, abs = Math.abs;
    var P = numeric.linspace(0,m-1),Pinv = numeric.linspace(0,m-1);
    var dfs = new numeric.ccsDFS0(m);
    if(typeof threshold === "undefined") { threshold = 1; }
    for(i=0;i<m;++i) {
        sol(L,A,y,xj,i,Pinv,P,dfs);
        a = -1;
        e = -1;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            if(k <= i) continue;
            c = abs(y[P[k]]);
            if(c > a) { e = k; a = c; }
        }
        if(abs(y[P[i]])<threshold*a) {
            j = P[i];
            a = P[e];
            P[i] = a; Pinv[a] = i;
            P[e] = j; Pinv[j] = e;
        }
        a = Li[i];
        e = Ui[i];
        d = y[P[i]];
        Lj[a] = P[i];
        Lv[a] = 1;
        ++a;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            c = y[P[k]];
            xj[j] = 0;
            y[P[k]] = 0;
            if(k<=i) { Uj[e] = k; Uv[e] = c;   ++e; }
            else     { Lj[a] = P[k]; Lv[a] = c/d; ++a; }
        }
        Li[i+1] = a;
        Ui[i+1] = e;
    }
    for(j=Lj.length-1;j!==-1;--j) { Lj[j] = Pinv[Lj[j]]; }
    return {L:L, U:U, P:P, Pinv:Pinv};
}
numeric.ccsLUP = numeric.ccsLUP0;

numeric.ccsDim = function ccsDim(A) { return [numeric.sup(A[1])+1,A[0].length-1]; }
numeric.ccsGetBlock = function ccsGetBlock(A,i,j) {
    var s = numeric.ccsDim(A),m=s[0],n=s[1];
    if(typeof i === "undefined") { i = numeric.linspace(0,m-1); }
    else if(typeof i === "number") { i = [i]; }
    if(typeof j === "undefined") { j = numeric.linspace(0,n-1); }
    else if(typeof j === "number") { j = [j]; }
    var p,p0,p1,P = i.length,q,Q = j.length,r,jq,ip;
    var Bi = numeric.rep([n],0), Bj=[], Bv=[], B = [Bi,Bj,Bv];
    var Ai = A[0], Aj = A[1], Av = A[2];
    var x = numeric.rep([m],0),count=0,flags = numeric.rep([m],0);
    for(q=0;q<Q;++q) {
        jq = j[q];
        var q0 = Ai[jq];
        var q1 = Ai[jq+1];
        for(p=q0;p<q1;++p) {
            r = Aj[p];
            flags[r] = 1;
            x[r] = Av[p];
        }
        for(p=0;p<P;++p) {
            ip = i[p];
            if(flags[ip]) {
                Bj[count] = p;
                Bv[count] = x[i[p]];
                ++count;
            }
        }
        for(p=q0;p<q1;++p) {
            r = Aj[p];
            flags[r] = 0;
        }
        Bi[q+1] = count;
    }
    return B;
}

numeric.ccsDot = function ccsDot(A,B) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var Bi = B[0], Bj = B[1], Bv = B[2];
    var sA = numeric.ccsDim(A), sB = numeric.ccsDim(B);
    var m = sA[0], n = sA[1], o = sB[1];
    var x = numeric.rep([m],0), flags = numeric.rep([m],0), xj = Array(m);
    var Ci = numeric.rep([o],0), Cj = [], Cv = [], C = [Ci,Cj,Cv];
    var i,j,k,j0,j1,i0,i1,l,p,a,b;
    for(k=0;k!==o;++k) {
        j0 = Bi[k];
        j1 = Bi[k+1];
        p = 0;
        for(j=j0;j<j1;++j) {
            a = Bj[j];
            b = Bv[j];
            i0 = Ai[a];
            i1 = Ai[a+1];
            for(i=i0;i<i1;++i) {
                l = Aj[i];
                if(flags[l]===0) {
                    xj[p] = l;
                    flags[l] = 1;
                    p = p+1;
                }
                x[l] = x[l] + Av[i]*b;
            }
        }
        j0 = Ci[k];
        j1 = j0+p;
        Ci[k+1] = j1;
        for(j=p-1;j!==-1;--j) {
            b = j0+j;
            i = xj[j];
            Cj[b] = i;
            Cv[b] = x[i];
            flags[i] = 0;
            x[i] = 0;
        }
        Ci[k+1] = Ci[k]+p;
    }
    return C;
}

numeric.ccsLUPSolve = function ccsLUPSolve(LUP,B) {
    var L = LUP.L, U = LUP.U, P = LUP.P;
    var Bi = B[0];
    var flag = false;
    if(typeof Bi !== "object") { B = [[0,B.length],numeric.linspace(0,B.length-1),B]; Bi = B[0]; flag = true; }
    var Bj = B[1], Bv = B[2];
    var n = L[0].length-1, m = Bi.length-1;
    var x = numeric.rep([n],0), xj = Array(n);
    var b = numeric.rep([n],0), bj = Array(n);
    var Xi = numeric.rep([m+1],0), Xj = [], Xv = [];
    var sol = numeric.ccsTSolve;
    var i,j,j0,j1,k,J,N=0;
    for(i=0;i<m;++i) {
        k = 0;
        j0 = Bi[i];
        j1 = Bi[i+1];
        for(j=j0;j<j1;++j) { 
            J = LUP.Pinv[Bj[j]];
            bj[k] = J;
            b[J] = Bv[j];
            ++k;
        }
        bj.length = k;
        sol(L,b,x,bj,xj);
        for(j=bj.length-1;j!==-1;--j) b[bj[j]] = 0;
        sol(U,x,b,xj,bj);
        if(flag) return b;
        for(j=xj.length-1;j!==-1;--j) x[xj[j]] = 0;
        for(j=bj.length-1;j!==-1;--j) {
            J = bj[j];
            Xj[N] = J;
            Xv[N] = b[J];
            b[J] = 0;
            ++N;
        }
        Xi[i+1] = N;
    }
    return [Xi,Xj,Xv];
}

numeric.ccsbinop = function ccsbinop(body,setup) {
    if(typeof setup === "undefined") setup='';
    return Function('X','Y',
            'var Xi = X[0], Xj = X[1], Xv = X[2];\n'+
            'var Yi = Y[0], Yj = Y[1], Yv = Y[2];\n'+
            'var n = Xi.length-1,m = Math.max(numeric.sup(Xj),numeric.sup(Yj))+1;\n'+
            'var Zi = numeric.rep([n+1],0), Zj = [], Zv = [];\n'+
            'var x = numeric.rep([m],0),y = numeric.rep([m],0);\n'+
            'var xk,yk,zk;\n'+
            'var i,j,j0,j1,k,p=0;\n'+
            setup+
            'for(i=0;i<n;++i) {\n'+
            '  j0 = Xi[i]; j1 = Xi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) {\n'+
            '    k = Xj[j];\n'+
            '    x[k] = 1;\n'+
            '    Zj[p] = k;\n'+
            '    ++p;\n'+
            '  }\n'+
            '  j0 = Yi[i]; j1 = Yi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) {\n'+
            '    k = Yj[j];\n'+
            '    y[k] = Yv[j];\n'+
            '    if(x[k] === 0) {\n'+
            '      Zj[p] = k;\n'+
            '      ++p;\n'+
            '    }\n'+
            '  }\n'+
            '  Zi[i+1] = p;\n'+
            '  j0 = Xi[i]; j1 = Xi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) x[Xj[j]] = Xv[j];\n'+
            '  j0 = Zi[i]; j1 = Zi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) {\n'+
            '    k = Zj[j];\n'+
            '    xk = x[k];\n'+
            '    yk = y[k];\n'+
            body+'\n'+
            '    Zv[j] = zk;\n'+
            '  }\n'+
            '  j0 = Xi[i]; j1 = Xi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) x[Xj[j]] = 0;\n'+
            '  j0 = Yi[i]; j1 = Yi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) y[Yj[j]] = 0;\n'+
            '}\n'+
            'return [Zi,Zj,Zv];'
            );
};

(function() {
    var k,A,B,C;
    for(k in numeric.ops2) {
        if(isFinite(eval('1'+numeric.ops2[k]+'0'))) A = '[Y[0],Y[1],numeric.'+k+'(X,Y[2])]';
        else A = 'NaN';
        if(isFinite(eval('0'+numeric.ops2[k]+'1'))) B = '[X[0],X[1],numeric.'+k+'(X[2],Y)]';
        else B = 'NaN';
        if(isFinite(eval('1'+numeric.ops2[k]+'0')) && isFinite(eval('0'+numeric.ops2[k]+'1'))) C = 'numeric.ccs'+k+'MM(X,Y)';
        else C = 'NaN';
        numeric['ccs'+k+'MM'] = numeric.ccsbinop('zk = xk '+numeric.ops2[k]+'yk;');
        numeric['ccs'+k] = Function('X','Y',
                'if(typeof X === "number") return '+A+';\n'+
                'if(typeof Y === "number") return '+B+';\n'+
                'return '+C+';\n'
                );
    }
}());

numeric.ccsScatter = function ccsScatter(A) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var n = numeric.sup(Aj)+1,m=Ai.length;
    var Ri = numeric.rep([n],0),Rj=Array(m), Rv = Array(m);
    var counts = numeric.rep([n],0),i;
    for(i=0;i<m;++i) counts[Aj[i]]++;
    for(i=0;i<n;++i) Ri[i+1] = Ri[i] + counts[i];
    var ptr = Ri.slice(0),k,Aii;
    for(i=0;i<m;++i) {
        Aii = Aj[i];
        k = ptr[Aii];
        Rj[k] = Ai[i];
        Rv[k] = Av[i];
        ptr[Aii]=ptr[Aii]+1;
    }
    return [Ri,Rj,Rv];
}

numeric.ccsGather = function ccsGather(A) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var n = Ai.length-1,m = Aj.length;
    var Ri = Array(m), Rj = Array(m), Rv = Array(m);
    var i,j,j0,j1,p;
    p=0;
    for(i=0;i<n;++i) {
        j0 = Ai[i];
        j1 = Ai[i+1];
        for(j=j0;j!==j1;++j) {
            Rj[p] = i;
            Ri[p] = Aj[j];
            Rv[p] = Av[j];
            ++p;
        }
    }
    return [Ri,Rj,Rv];
}

// The following sparse linear algebra routines are deprecated.

numeric.sdim = function dim(A,ret,k) {
    if(typeof ret === "undefined") { ret = []; }
    if(typeof A !== "object") return ret;
    if(typeof k === "undefined") { k=0; }
    if(!(k in ret)) { ret[k] = 0; }
    if(A.length > ret[k]) ret[k] = A.length;
    var i;
    for(i in A) {
        if(A.hasOwnProperty(i)) dim(A[i],ret,k+1);
    }
    return ret;
};

numeric.sclone = function clone(A,k,n) {
    if(typeof k === "undefined") { k=0; }
    if(typeof n === "undefined") { n = numeric.sdim(A).length; }
    var i,ret = Array(A.length);
    if(k === n-1) {
        for(i in A) { if(A.hasOwnProperty(i)) ret[i] = A[i]; }
        return ret;
    }
    for(i in A) {
        if(A.hasOwnProperty(i)) ret[i] = clone(A[i],k+1,n);
    }
    return ret;
}

numeric.sdiag = function diag(d) {
    var n = d.length,i,ret = Array(n),i1,i2,i3;
    for(i=n-1;i>=1;i-=2) {
        i1 = i-1;
        ret[i] = []; ret[i][i] = d[i];
        ret[i1] = []; ret[i1][i1] = d[i1];
    }
    if(i===0) { ret[0] = []; ret[0][0] = d[i]; }
    return ret;
}

numeric.sidentity = function identity(n) { return numeric.sdiag(numeric.rep([n],1)); }

numeric.stranspose = function transpose(A) {
    var ret = [], n = A.length, i,j,Ai;
    for(i in A) {
        if(!(A.hasOwnProperty(i))) continue;
        Ai = A[i];
        for(j in Ai) {
            if(!(Ai.hasOwnProperty(j))) continue;
            if(typeof ret[j] !== "object") { ret[j] = []; }
            ret[j][i] = Ai[j];
        }
    }
    return ret;
}

numeric.sLUP = function LUP(A,tol) {
    throw new Error("The function numeric.sLUP had a bug in it and has been removed. Please use the new numeric.ccsLUP function instead.");
};

numeric.sdotMM = function dotMM(A,B) {
    var p = A.length, q = B.length, BT = numeric.stranspose(B), r = BT.length, Ai, BTk;
    var i,j,k,accum;
    var ret = Array(p),reti;
    for(i=p-1;i>=0;i--) {
        reti = [];
        Ai = A[i];
        for(k=r-1;k>=0;k--) {
            accum = 0;
            BTk = BT[k];
            for(j in Ai) {
                if(!(Ai.hasOwnProperty(j))) continue;
                if(j in BTk) { accum += Ai[j]*BTk[j]; }
            }
            if(accum) reti[k] = accum;
        }
        ret[i] = reti;
    }
    return ret;
}

numeric.sdotMV = function dotMV(A,x) {
    var p = A.length, Ai, i,j;
    var ret = Array(p), accum;
    for(i=p-1;i>=0;i--) {
        Ai = A[i];
        accum = 0;
        for(j in Ai) {
            if(!(Ai.hasOwnProperty(j))) continue;
            if(x[j]) accum += Ai[j]*x[j];
        }
        if(accum) ret[i] = accum;
    }
    return ret;
}

numeric.sdotVM = function dotMV(x,A) {
    var i,j,Ai,alpha;
    var ret = [], accum;
    for(i in x) {
        if(!x.hasOwnProperty(i)) continue;
        Ai = A[i];
        alpha = x[i];
        for(j in Ai) {
            if(!Ai.hasOwnProperty(j)) continue;
            if(!ret[j]) { ret[j] = 0; }
            ret[j] += alpha*Ai[j];
        }
    }
    return ret;
}

numeric.sdotVV = function dotVV(x,y) {
    var i,ret=0;
    for(i in x) { if(x[i] && y[i]) ret+= x[i]*y[i]; }
    return ret;
}

numeric.sdot = function dot(A,B) {
    var m = numeric.sdim(A).length, n = numeric.sdim(B).length;
    var k = m*1000+n;
    switch(k) {
    case 0: return A*B;
    case 1001: return numeric.sdotVV(A,B);
    case 2001: return numeric.sdotMV(A,B);
    case 1002: return numeric.sdotVM(A,B);
    case 2002: return numeric.sdotMM(A,B);
    default: throw new Error('numeric.sdot not implemented for tensors of order '+m+' and '+n);
    }
}

numeric.sscatter = function scatter(V) {
    var n = V[0].length, Vij, i, j, m = V.length, A = [], Aj;
    for(i=n-1;i>=0;--i) {
        if(!V[m-1][i]) continue;
        Aj = A;
        for(j=0;j<m-2;j++) {
            Vij = V[j][i];
            if(!Aj[Vij]) Aj[Vij] = [];
            Aj = Aj[Vij];
        }
        Aj[V[j][i]] = V[j+1][i];
    }
    return A;
}

numeric.sgather = function gather(A,ret,k) {
    if(typeof ret === "undefined") ret = [];
    if(typeof k === "undefined") k = [];
    var n,i,Ai;
    n = k.length;
    for(i in A) {
        if(A.hasOwnProperty(i)) {
            k[n] = parseInt(i);
            Ai = A[i];
            if(typeof Ai === "number") {
                if(Ai) {
                    if(ret.length === 0) {
                        for(i=n+1;i>=0;--i) ret[i] = [];
                    }
                    for(i=n;i>=0;--i) ret[i].push(k[i]);
                    ret[n+1].push(Ai);
                }
            } else gather(Ai,ret,k);
        }
    }
    if(k.length>n) k.pop();
    return ret;
}

// 6. Coordinate matrices
numeric.cLU = function LU(A) {
    var I = A[0], J = A[1], V = A[2];
    var p = I.length, m=0, i,j,k,a,b,c;
    for(i=0;i<p;i++) if(I[i]>m) m=I[i];
    m++;
    var L = Array(m), U = Array(m), left = numeric.rep([m],Infinity), right = numeric.rep([m],-Infinity);
    var Ui, Uj,alpha;
    for(k=0;k<p;k++) {
        i = I[k];
        j = J[k];
        if(j<left[i]) left[i] = j;
        if(j>right[i]) right[i] = j;
    }
    for(i=0;i<m-1;i++) { if(right[i] > right[i+1]) right[i+1] = right[i]; }
    for(i=m-1;i>=1;i--) { if(left[i]<left[i-1]) left[i-1] = left[i]; }
    var countL = 0, countU = 0;
    for(i=0;i<m;i++) {
        U[i] = numeric.rep([right[i]-left[i]+1],0);
        L[i] = numeric.rep([i-left[i]],0);
        countL += i-left[i]+1;
        countU += right[i]-i+1;
    }
    for(k=0;k<p;k++) { i = I[k]; U[i][J[k]-left[i]] = V[k]; }
    for(i=0;i<m-1;i++) {
        a = i-left[i];
        Ui = U[i];
        for(j=i+1;left[j]<=i && j<m;j++) {
            b = i-left[j];
            c = right[i]-i;
            Uj = U[j];
            alpha = Uj[b]/Ui[a];
            if(alpha) {
                for(k=1;k<=c;k++) { Uj[k+b] -= alpha*Ui[k+a]; }
                L[j][i-left[j]] = alpha;
            }
        }
    }
    var Ui = [], Uj = [], Uv = [], Li = [], Lj = [], Lv = [];
    var p,q,foo;
    p=0; q=0;
    for(i=0;i<m;i++) {
        a = left[i];
        b = right[i];
        foo = U[i];
        for(j=i;j<=b;j++) {
            if(foo[j-a]) {
                Ui[p] = i;
                Uj[p] = j;
                Uv[p] = foo[j-a];
                p++;
            }
        }
        foo = L[i];
        for(j=a;j<i;j++) {
            if(foo[j-a]) {
                Li[q] = i;
                Lj[q] = j;
                Lv[q] = foo[j-a];
                q++;
            }
        }
        Li[q] = i;
        Lj[q] = i;
        Lv[q] = 1;
        q++;
    }
    return {U:[Ui,Uj,Uv], L:[Li,Lj,Lv]};
};

numeric.cLUsolve = function LUsolve(lu,b) {
    var L = lu.L, U = lu.U, ret = numeric.clone(b);
    var Li = L[0], Lj = L[1], Lv = L[2];
    var Ui = U[0], Uj = U[1], Uv = U[2];
    var p = Ui.length, q = Li.length;
    var m = ret.length,i,j,k;
    k = 0;
    for(i=0;i<m;i++) {
        while(Lj[k] < i) {
            ret[i] -= Lv[k]*ret[Lj[k]];
            k++;
        }
        k++;
    }
    k = p-1;
    for(i=m-1;i>=0;i--) {
        while(Uj[k] > i) {
            ret[i] -= Uv[k]*ret[Uj[k]];
            k--;
        }
        ret[i] /= Uv[k];
        k--;
    }
    return ret;
};

numeric.cgrid = function grid(n,shape) {
    if(typeof n === "number") n = [n,n];
    var ret = numeric.rep(n,-1);
    var i,j,count;
    if(typeof shape !== "function") {
        switch(shape) {
        case 'L':
            shape = function(i,j) { return (i>=n[0]/2 || j<n[1]/2); }
            break;
        default:
            shape = function(i,j) { return true; };
            break;
        }
    }
    count=0;
    for(i=1;i<n[0]-1;i++) for(j=1;j<n[1]-1;j++) 
        if(shape(i,j)) {
            ret[i][j] = count;
            count++;
        }
    return ret;
}

numeric.cdelsq = function delsq(g) {
    var dir = [[-1,0],[0,-1],[0,1],[1,0]];
    var s = numeric.dim(g), m = s[0], n = s[1], i,j,k,p,q;
    var Li = [], Lj = [], Lv = [];
    for(i=1;i<m-1;i++) for(j=1;j<n-1;j++) {
        if(g[i][j]<0) continue;
        for(k=0;k<4;k++) {
            p = i+dir[k][0];
            q = j+dir[k][1];
            if(g[p][q]<0) continue;
            Li.push(g[i][j]);
            Lj.push(g[p][q]);
            Lv.push(-1);
        }
        Li.push(g[i][j]);
        Lj.push(g[i][j]);
        Lv.push(4);
    }
    return [Li,Lj,Lv];
}

numeric.cdotMV = function dotMV(A,x) {
    var ret, Ai = A[0], Aj = A[1], Av = A[2],k,p=Ai.length,N;
    N=0;
    for(k=0;k<p;k++) { if(Ai[k]>N) N = Ai[k]; }
    N++;
    ret = numeric.rep([N],0);
    for(k=0;k<p;k++) { ret[Ai[k]]+=Av[k]*x[Aj[k]]; }
    return ret;
}

// 7. Splines

numeric.Spline = function Spline(x,yl,yr,kl,kr) { this.x = x; this.yl = yl; this.yr = yr; this.kl = kl; this.kr = kr; }
numeric.Spline.prototype._at = function _at(x1,p) {
    var x = this.x;
    var yl = this.yl;
    var yr = this.yr;
    var kl = this.kl;
    var kr = this.kr;
    var x1,a,b,t;
    var add = numeric.add, sub = numeric.sub, mul = numeric.mul;
    a = sub(mul(kl[p],x[p+1]-x[p]),sub(yr[p+1],yl[p]));
    b = add(mul(kr[p+1],x[p]-x[p+1]),sub(yr[p+1],yl[p]));
    t = (x1-x[p])/(x[p+1]-x[p]);
    var s = t*(1-t);
    return add(add(add(mul(1-t,yl[p]),mul(t,yr[p+1])),mul(a,s*(1-t))),mul(b,s*t));
}
numeric.Spline.prototype.at = function at(x0) {
    if(typeof x0 === "number") {
        var x = this.x;
        var n = x.length;
        var p,q,mid,floor = Math.floor,a,b,t;
        p = 0;
        q = n-1;
        while(q-p>1) {
            mid = floor((p+q)/2);
            if(x[mid] <= x0) p = mid;
            else q = mid;
        }
        return this._at(x0,p);
    }
    var n = x0.length, i, ret = Array(n);
    for(i=n-1;i!==-1;--i) ret[i] = this.at(x0[i]);
    return ret;
}
numeric.Spline.prototype.diff = function diff() {
    var x = this.x;
    var yl = this.yl;
    var yr = this.yr;
    var kl = this.kl;
    var kr = this.kr;
    var n = yl.length;
    var i,dx,dy;
    var zl = kl, zr = kr, pl = Array(n), pr = Array(n);
    var add = numeric.add, mul = numeric.mul, div = numeric.div, sub = numeric.sub;
    for(i=n-1;i!==-1;--i) {
        dx = x[i+1]-x[i];
        dy = sub(yr[i+1],yl[i]);
        pl[i] = div(add(mul(dy, 6),mul(kl[i],-4*dx),mul(kr[i+1],-2*dx)),dx*dx);
        pr[i+1] = div(add(mul(dy,-6),mul(kl[i], 2*dx),mul(kr[i+1], 4*dx)),dx*dx);
    }
    return new numeric.Spline(x,zl,zr,pl,pr);
}
numeric.Spline.prototype.roots = function roots() {
    function sqr(x) { return x*x; }
    function heval(y0,y1,k0,k1,x) {
        var A = k0*2-(y1-y0);
        var B = -k1*2+(y1-y0);
        var t = (x+1)*0.5;
        var s = t*(1-t);
        return (1-t)*y0+t*y1+A*s*(1-t)+B*s*t;
    }
    var ret = [];
    var x = this.x, yl = this.yl, yr = this.yr, kl = this.kl, kr = this.kr;
    if(typeof yl[0] === "number") {
        yl = [yl];
        yr = [yr];
        kl = [kl];
        kr = [kr];
    }
    var m = yl.length,n=x.length-1,i,j,k,y,s,t;
    var ai,bi,ci,di, ret = Array(m),ri,k0,k1,y0,y1,A,B,D,dx,cx,stops,z0,z1,zm,t0,t1,tm;
    var sqrt = Math.sqrt;
    for(i=0;i!==m;++i) {
        ai = yl[i];
        bi = yr[i];
        ci = kl[i];
        di = kr[i];
        ri = [];
        for(j=0;j!==n;j++) {
            if(j>0 && bi[j]*ai[j]<0) ri.push(x[j]);
            dx = (x[j+1]-x[j]);
            cx = x[j];
            y0 = ai[j];
            y1 = bi[j+1];
            k0 = ci[j]/dx;
            k1 = di[j+1]/dx;
            D = sqr(k0-k1+3*(y0-y1)) + 12*k1*y0;
            A = k1+3*y0+2*k0-3*y1;
            B = 3*(k1+k0+2*(y0-y1));
            if(D<=0) {
                z0 = A/B;
                if(z0>x[j] && z0<x[j+1]) stops = [x[j],z0,x[j+1]];
                else stops = [x[j],x[j+1]];
            } else {
                z0 = (A-sqrt(D))/B;
                z1 = (A+sqrt(D))/B;
                stops = [x[j]];
                if(z0>x[j] && z0<x[j+1]) stops.push(z0);
                if(z1>x[j] && z1<x[j+1]) stops.push(z1);
                stops.push(x[j+1]);
            }
            t0 = stops[0];
            z0 = this._at(t0,j);
            for(k=0;k<stops.length-1;k++) {
                t1 = stops[k+1];
                z1 = this._at(t1,j);
                if(z0 === 0) {
                    ri.push(t0); 
                    t0 = t1;
                    z0 = z1;
                    continue;
                }
                if(z1 === 0 || z0*z1>0) {
                    t0 = t1;
                    z0 = z1;
                    continue;
                }
                var side = 0;
                while(1) {
                    tm = (z0*t1-z1*t0)/(z0-z1);
                    if(tm <= t0 || tm >= t1) { break; }
                    zm = this._at(tm,j);
                    if(zm*z1>0) {
                        t1 = tm;
                        z1 = zm;
                        if(side === -1) z0*=0.5;
                        side = -1;
                    } else if(zm*z0>0) {
                        t0 = tm;
                        z0 = zm;
                        if(side === 1) z1*=0.5;
                        side = 1;
                    } else break;
                }
                ri.push(tm);
                t0 = stops[k+1];
                z0 = this._at(t0, j);
            }
            if(z1 === 0) ri.push(t1);
        }
        ret[i] = ri;
    }
    if(typeof this.yl[0] === "number") return ret[0];
    return ret;
}
numeric.spline = function spline(x,y,k1,kn) {
    var n = x.length, b = [], dx = [], dy = [];
    var i;
    var sub = numeric.sub,mul = numeric.mul,add = numeric.add;
    for(i=n-2;i>=0;i--) { dx[i] = x[i+1]-x[i]; dy[i] = sub(y[i+1],y[i]); }
    if(typeof k1 === "string" || typeof kn === "string") { 
        k1 = kn = "periodic";
    }
    // Build sparse tridiagonal system
    var T = [[],[],[]];
    switch(typeof k1) {
    case "undefined":
        b[0] = mul(3/(dx[0]*dx[0]),dy[0]);
        T[0].push(0,0);
        T[1].push(0,1);
        T[2].push(2/dx[0],1/dx[0]);
        break;
    case "string":
        b[0] = add(mul(3/(dx[n-2]*dx[n-2]),dy[n-2]),mul(3/(dx[0]*dx[0]),dy[0]));
        T[0].push(0,0,0);
        T[1].push(n-2,0,1);
        T[2].push(1/dx[n-2],2/dx[n-2]+2/dx[0],1/dx[0]);
        break;
    default:
        b[0] = k1;
        T[0].push(0);
        T[1].push(0);
        T[2].push(1);
        break;
    }
    for(i=1;i<n-1;i++) {
        b[i] = add(mul(3/(dx[i-1]*dx[i-1]),dy[i-1]),mul(3/(dx[i]*dx[i]),dy[i]));
        T[0].push(i,i,i);
        T[1].push(i-1,i,i+1);
        T[2].push(1/dx[i-1],2/dx[i-1]+2/dx[i],1/dx[i]);
    }
    switch(typeof kn) {
    case "undefined":
        b[n-1] = mul(3/(dx[n-2]*dx[n-2]),dy[n-2]);
        T[0].push(n-1,n-1);
        T[1].push(n-2,n-1);
        T[2].push(1/dx[n-2],2/dx[n-2]);
        break;
    case "string":
        T[1][T[1].length-1] = 0;
        break;
    default:
        b[n-1] = kn;
        T[0].push(n-1);
        T[1].push(n-1);
        T[2].push(1);
        break;
    }
    if(typeof b[0] !== "number") b = numeric.transpose(b);
    else b = [b];
    var k = Array(b.length);
    if(typeof k1 === "string") {
        for(i=k.length-1;i!==-1;--i) {
            k[i] = numeric.ccsLUPSolve(numeric.ccsLUP(numeric.ccsScatter(T)),b[i]);
            k[i][n-1] = k[i][0];
        }
    } else {
        for(i=k.length-1;i!==-1;--i) {
            k[i] = numeric.cLUsolve(numeric.cLU(T),b[i]);
        }
    }
    if(typeof y[0] === "number") k = k[0];
    else k = numeric.transpose(k);
    return new numeric.Spline(x,y,y,k,k);
}

// 8. FFT
numeric.fftpow2 = function fftpow2(x,y) {
    var n = x.length;
    if(n === 1) return;
    var cos = Math.cos, sin = Math.sin, i,j;
    var xe = Array(n/2), ye = Array(n/2), xo = Array(n/2), yo = Array(n/2);
    j = n/2;
    for(i=n-1;i!==-1;--i) {
        --j;
        xo[j] = x[i];
        yo[j] = y[i];
        --i;
        xe[j] = x[i];
        ye[j] = y[i];
    }
    fftpow2(xe,ye);
    fftpow2(xo,yo);
    j = n/2;
    var t,k = (-6.2831853071795864769252867665590057683943387987502116419/n),ci,si;
    for(i=n-1;i!==-1;--i) {
        --j;
        if(j === -1) j = n/2-1;
        t = k*i;
        ci = cos(t);
        si = sin(t);
        x[i] = xe[j] + ci*xo[j] - si*yo[j];
        y[i] = ye[j] + ci*yo[j] + si*xo[j];
    }
}
numeric._ifftpow2 = function _ifftpow2(x,y) {
    var n = x.length;
    if(n === 1) return;
    var cos = Math.cos, sin = Math.sin, i,j;
    var xe = Array(n/2), ye = Array(n/2), xo = Array(n/2), yo = Array(n/2);
    j = n/2;
    for(i=n-1;i!==-1;--i) {
        --j;
        xo[j] = x[i];
        yo[j] = y[i];
        --i;
        xe[j] = x[i];
        ye[j] = y[i];
    }
    _ifftpow2(xe,ye);
    _ifftpow2(xo,yo);
    j = n/2;
    var t,k = (6.2831853071795864769252867665590057683943387987502116419/n),ci,si;
    for(i=n-1;i!==-1;--i) {
        --j;
        if(j === -1) j = n/2-1;
        t = k*i;
        ci = cos(t);
        si = sin(t);
        x[i] = xe[j] + ci*xo[j] - si*yo[j];
        y[i] = ye[j] + ci*yo[j] + si*xo[j];
    }
}
numeric.ifftpow2 = function ifftpow2(x,y) {
    numeric._ifftpow2(x,y);
    numeric.diveq(x,x.length);
    numeric.diveq(y,y.length);
}
numeric.convpow2 = function convpow2(ax,ay,bx,by) {
    numeric.fftpow2(ax,ay);
    numeric.fftpow2(bx,by);
    var i,n = ax.length,axi,bxi,ayi,byi;
    for(i=n-1;i!==-1;--i) {
        axi = ax[i]; ayi = ay[i]; bxi = bx[i]; byi = by[i];
        ax[i] = axi*bxi-ayi*byi;
        ay[i] = axi*byi+ayi*bxi;
    }
    numeric.ifftpow2(ax,ay);
}
numeric.T.prototype.fft = function fft() {
    var x = this.x, y = this.y;
    var n = x.length, log = Math.log, log2 = log(2),
        p = Math.ceil(log(2*n-1)/log2), m = Math.pow(2,p);
    var cx = numeric.rep([m],0), cy = numeric.rep([m],0), cos = Math.cos, sin = Math.sin;
    var k, c = (-3.141592653589793238462643383279502884197169399375105820/n),t;
    var a = numeric.rep([m],0), b = numeric.rep([m],0),nhalf = Math.floor(n/2);
    for(k=0;k<n;k++) a[k] = x[k];
    if(typeof y !== "undefined") for(k=0;k<n;k++) b[k] = y[k];
    cx[0] = 1;
    for(k=1;k<=m/2;k++) {
        t = c*k*k;
        cx[k] = cos(t);
        cy[k] = sin(t);
        cx[m-k] = cos(t);
        cy[m-k] = sin(t)
    }
    var X = new numeric.T(a,b), Y = new numeric.T(cx,cy);
    X = X.mul(Y);
    numeric.convpow2(X.x,X.y,numeric.clone(Y.x),numeric.neg(Y.y));
    X = X.mul(Y);
    X.x.length = n;
    X.y.length = n;
    return X;
}
numeric.T.prototype.ifft = function ifft() {
    var x = this.x, y = this.y;
    var n = x.length, log = Math.log, log2 = log(2),
        p = Math.ceil(log(2*n-1)/log2), m = Math.pow(2,p);
    var cx = numeric.rep([m],0), cy = numeric.rep([m],0), cos = Math.cos, sin = Math.sin;
    var k, c = (3.141592653589793238462643383279502884197169399375105820/n),t;
    var a = numeric.rep([m],0), b = numeric.rep([m],0),nhalf = Math.floor(n/2);
    for(k=0;k<n;k++) a[k] = x[k];
    if(typeof y !== "undefined") for(k=0;k<n;k++) b[k] = y[k];
    cx[0] = 1;
    for(k=1;k<=m/2;k++) {
        t = c*k*k;
        cx[k] = cos(t);
        cy[k] = sin(t);
        cx[m-k] = cos(t);
        cy[m-k] = sin(t)
    }
    var X = new numeric.T(a,b), Y = new numeric.T(cx,cy);
    X = X.mul(Y);
    numeric.convpow2(X.x,X.y,numeric.clone(Y.x),numeric.neg(Y.y));
    X = X.mul(Y);
    X.x.length = n;
    X.y.length = n;
    return X.div(n);
}

//9. Unconstrained optimization
numeric.gradient = function gradient(f,x) {
    var n = x.length;
    var f0 = f(x);
    if(isNaN(f0)) throw new Error('gradient: f(x) is a NaN!');
    var max = Math.max;
    var i,x0 = numeric.clone(x),f1,f2, J = Array(n);
    var div = numeric.div, sub = numeric.sub,errest,roundoff,max = Math.max,eps = 1e-3,abs = Math.abs, min = Math.min;
    var t0,t1,t2,it=0,d1,d2,N;
    for(i=0;i<n;i++) {
        var h = max(1e-6*f0,1e-8);
        while(1) {
            ++it;
            if(it>20) { throw new Error("Numerical gradient fails"); }
            x0[i] = x[i]+h;
            f1 = f(x0);
            x0[i] = x[i]-h;
            f2 = f(x0);
            x0[i] = x[i];
            if(isNaN(f1) || isNaN(f2)) { h/=16; continue; }
            J[i] = (f1-f2)/(2*h);
            t0 = x[i]-h;
            t1 = x[i];
            t2 = x[i]+h;
            d1 = (f1-f0)/h;
            d2 = (f0-f2)/h;
            N = max(abs(J[i]),abs(f0),abs(f1),abs(f2),abs(t0),abs(t1),abs(t2),1e-8);
            errest = min(max(abs(d1-J[i]),abs(d2-J[i]),abs(d1-d2))/N,h/N);
            if(errest>eps) { h/=16; }
            else break;
            }
    }
    return J;
}

numeric.uncmin = function uncmin(f,x0,tol,gradient,maxit,callback,options) {
    var grad = numeric.gradient;
    if(typeof options === "undefined") { options = {}; }
    if(typeof tol === "undefined") { tol = 1e-8; }
    if(typeof gradient === "undefined") { gradient = function(x) { return grad(f,x); }; }
    if(typeof maxit === "undefined") maxit = 1000;
    x0 = numeric.clone(x0);
    var n = x0.length;
    var f0 = f(x0),f1,df0;
    if(isNaN(f0)) throw new Error('uncmin: f(x0) is a NaN!');
    var max = Math.max, norm2 = numeric.norm2;
    tol = max(tol,numeric.epsilon);
    var step,g0,g1,H1 = options.Hinv || numeric.identity(n);
    var dot = numeric.dot, inv = numeric.inv, sub = numeric.sub, add = numeric.add, ten = numeric.tensor, div = numeric.div, mul = numeric.mul;
    var all = numeric.all, isfinite = numeric.isFinite, neg = numeric.neg;
    var it=0,i,s,x1,y,Hy,Hs,ys,i0,t,nstep,t1,t2;
    var msg = "";
    g0 = gradient(x0);
    while(it<maxit) {
        if(typeof callback === "function") { if(callback(it,x0,f0,g0,H1)) { msg = "Callback returned true"; break; } }
        if(!all(isfinite(g0))) { msg = "Gradient has Infinity or NaN"; break; }
        step = neg(dot(H1,g0));
        if(!all(isfinite(step))) { msg = "Search direction has Infinity or NaN"; break; }
        nstep = norm2(step);
        if(nstep < tol) { msg="Newton step smaller than tol"; break; }
        t = 1;
        df0 = dot(g0,step);
        // line search
        x1 = x0;
        while(it < maxit) {
            if(t*nstep < tol) { break; }
            s = mul(step,t);
            x1 = add(x0,s);
            f1 = f(x1);
            if(f1-f0 >= 0.1*t*df0 || isNaN(f1)) {
                t *= 0.5;
                ++it;
                continue;
            }
            break;
        }
        if(t*nstep < tol) { msg = "Line search step size smaller than tol"; break; }
        if(it === maxit) { msg = "maxit reached during line search"; break; }
        g1 = gradient(x1);
        y = sub(g1,g0);
        ys = dot(y,s);
        Hy = dot(H1,y);
        H1 = sub(add(H1,
                mul(
                        (ys+dot(y,Hy))/(ys*ys),
                        ten(s,s)    )),
                div(add(ten(Hy,s),ten(s,Hy)),ys));
        x0 = x1;
        f0 = f1;
        g0 = g1;
        ++it;
    }
    return {solution: x0, f: f0, gradient: g0, invHessian: H1, iterations:it, message: msg};
}

// 10. Ode solver (Dormand-Prince)
numeric.Dopri = function Dopri(x,y,f,ymid,iterations,msg,events) {
    this.x = x;
    this.y = y;
    this.f = f;
    this.ymid = ymid;
    this.iterations = iterations;
    this.events = events;
    this.message = msg;
}
numeric.Dopri.prototype._at = function _at(xi,j) {
    function sqr(x) { return x*x; }
    var sol = this;
    var xs = sol.x;
    var ys = sol.y;
    var k1 = sol.f;
    var ymid = sol.ymid;
    var n = xs.length;
    var x0,x1,xh,y0,y1,yh,xi;
    var floor = Math.floor,h;
    var c = 0.5;
    var add = numeric.add, mul = numeric.mul,sub = numeric.sub, p,q,w;
    x0 = xs[j];
    x1 = xs[j+1];
    y0 = ys[j];
    y1 = ys[j+1];
    h  = x1-x0;
    xh = x0+c*h;
    yh = ymid[j];
    p = sub(k1[j  ],mul(y0,1/(x0-xh)+2/(x0-x1)));
    q = sub(k1[j+1],mul(y1,1/(x1-xh)+2/(x1-x0)));
    w = [sqr(xi - x1) * (xi - xh) / sqr(x0 - x1) / (x0 - xh),
         sqr(xi - x0) * sqr(xi - x1) / sqr(x0 - xh) / sqr(x1 - xh),
         sqr(xi - x0) * (xi - xh) / sqr(x1 - x0) / (x1 - xh),
         (xi - x0) * sqr(xi - x1) * (xi - xh) / sqr(x0-x1) / (x0 - xh),
         (xi - x1) * sqr(xi - x0) * (xi - xh) / sqr(x0-x1) / (x1 - xh)];
    return add(add(add(add(mul(y0,w[0]),
                           mul(yh,w[1])),
                           mul(y1,w[2])),
                           mul( p,w[3])),
                           mul( q,w[4]));
}
numeric.Dopri.prototype.at = function at(x) {
    var i,j,k,floor = Math.floor;
    if(typeof x !== "number") {
        var n = x.length, ret = Array(n);
        for(i=n-1;i!==-1;--i) {
            ret[i] = this.at(x[i]);
        }
        return ret;
    }
    var x0 = this.x;
    i = 0; j = x0.length-1;
    while(j-i>1) {
        k = floor(0.5*(i+j));
        if(x0[k] <= x) i = k;
        else j = k;
    }
    return this._at(x,i);
}

numeric.dopri = function dopri(x0,x1,y0,f,tol,maxit,event) {
    if(typeof tol === "undefined") { tol = 1e-6; }
    if(typeof maxit === "undefined") { maxit = 1000; }
    var xs = [x0], ys = [y0], k1 = [f(x0,y0)], k2,k3,k4,k5,k6,k7, ymid = [];
    var A2 = 1/5;
    var A3 = [3/40,9/40];
    var A4 = [44/45,-56/15,32/9];
    var A5 = [19372/6561,-25360/2187,64448/6561,-212/729];
    var A6 = [9017/3168,-355/33,46732/5247,49/176,-5103/18656];
    var b = [35/384,0,500/1113,125/192,-2187/6784,11/84];
    var bm = [0.5*6025192743/30085553152,
              0,
              0.5*51252292925/65400821598,
              0.5*-2691868925/45128329728,
              0.5*187940372067/1594534317056,
              0.5*-1776094331/19743644256,
              0.5*11237099/235043384];
    var c = [1/5,3/10,4/5,8/9,1,1];
    var e = [-71/57600,0,71/16695,-71/1920,17253/339200,-22/525,1/40];
    var i = 0,er,j;
    var h = (x1-x0)/10;
    var it = 0;
    var add = numeric.add, mul = numeric.mul, y1,erinf;
    var max = Math.max, min = Math.min, abs = Math.abs, norminf = numeric.norminf,pow = Math.pow;
    var any = numeric.any, lt = numeric.lt, and = numeric.and, sub = numeric.sub;
    var e0, e1, ev;
    var ret = new numeric.Dopri(xs,ys,k1,ymid,-1,"");
    if(typeof event === "function") e0 = event(x0,y0);
    while(x0<x1 && it<maxit) {
        ++it;
        if(x0+h>x1) h = x1-x0;
        k2 = f(x0+c[0]*h,                add(y0,mul(   A2*h,k1[i])));
        k3 = f(x0+c[1]*h,            add(add(y0,mul(A3[0]*h,k1[i])),mul(A3[1]*h,k2)));
        k4 = f(x0+c[2]*h,        add(add(add(y0,mul(A4[0]*h,k1[i])),mul(A4[1]*h,k2)),mul(A4[2]*h,k3)));
        k5 = f(x0+c[3]*h,    add(add(add(add(y0,mul(A5[0]*h,k1[i])),mul(A5[1]*h,k2)),mul(A5[2]*h,k3)),mul(A5[3]*h,k4)));
        k6 = f(x0+c[4]*h,add(add(add(add(add(y0,mul(A6[0]*h,k1[i])),mul(A6[1]*h,k2)),mul(A6[2]*h,k3)),mul(A6[3]*h,k4)),mul(A6[4]*h,k5)));
        y1 = add(add(add(add(add(y0,mul(k1[i],h*b[0])),mul(k3,h*b[2])),mul(k4,h*b[3])),mul(k5,h*b[4])),mul(k6,h*b[5]));
        k7 = f(x0+h,y1);
        er = add(add(add(add(add(mul(k1[i],h*e[0]),mul(k3,h*e[2])),mul(k4,h*e[3])),mul(k5,h*e[4])),mul(k6,h*e[5])),mul(k7,h*e[6]));
        if(typeof er === "number") erinf = abs(er);
        else erinf = norminf(er);
        if(erinf > tol) { // reject
            h = 0.2*h*pow(tol/erinf,0.25);
            if(x0+h === x0) {
                ret.msg = "Step size became too small";
                break;
            }
            continue;
        }
        ymid[i] = add(add(add(add(add(add(y0,
                mul(k1[i],h*bm[0])),
                mul(k3   ,h*bm[2])),
                mul(k4   ,h*bm[3])),
                mul(k5   ,h*bm[4])),
                mul(k6   ,h*bm[5])),
                mul(k7   ,h*bm[6]));
        ++i;
        xs[i] = x0+h;
        ys[i] = y1;
        k1[i] = k7;
        if(typeof event === "function") {
            var yi,xl = x0,xr = x0+0.5*h,xi;
            e1 = event(xr,ymid[i-1]);
            ev = and(lt(e0,0),lt(0,e1));
            if(!any(ev)) { xl = xr; xr = x0+h; e0 = e1; e1 = event(xr,y1); ev = and(lt(e0,0),lt(0,e1)); }
            if(any(ev)) {
                var xc, yc, en,ei;
                var side=0, sl = 1.0, sr = 1.0;
                while(1) {
                    if(typeof e0 === "number") xi = (sr*e1*xl-sl*e0*xr)/(sr*e1-sl*e0);
                    else {
                        xi = xr;
                        for(j=e0.length-1;j!==-1;--j) {
                            if(e0[j]<0 && e1[j]>0) xi = min(xi,(sr*e1[j]*xl-sl*e0[j]*xr)/(sr*e1[j]-sl*e0[j]));
                        }
                    }
                    if(xi <= xl || xi >= xr) break;
                    yi = ret._at(xi, i-1);
                    ei = event(xi,yi);
                    en = and(lt(e0,0),lt(0,ei));
                    if(any(en)) {
                        xr = xi;
                        e1 = ei;
                        ev = en;
                        sr = 1.0;
                        if(side === -1) sl *= 0.5;
                        else sl = 1.0;
                        side = -1;
                    } else {
                        xl = xi;
                        e0 = ei;
                        sl = 1.0;
                        if(side === 1) sr *= 0.5;
                        else sr = 1.0;
                        side = 1;
                    }
                }
                y1 = ret._at(0.5*(x0+xi),i-1);
                ret.f[i] = f(xi,yi);
                ret.x[i] = xi;
                ret.y[i] = yi;
                ret.ymid[i-1] = y1;
                ret.events = ev;
                ret.iterations = it;
                return ret;
            }
        }
        x0 += h;
        y0 = y1;
        e0 = e1;
        h = min(0.8*h*pow(tol/erinf,0.25),4*h);
    }
    ret.iterations = it;
    return ret;
}

// 11. Ax = b
numeric.LU = function(A, fast) {
  fast = fast || false;

  var abs = Math.abs;
  var i, j, k, absAjk, Akk, Ak, Pk, Ai;
  var max;
  var n = A.length, n1 = n-1;
  var P = new Array(n);
  if(!fast) A = numeric.clone(A);

  for (k = 0; k < n; ++k) {
    Pk = k;
    Ak = A[k];
    max = abs(Ak[k]);
    for (j = k + 1; j < n; ++j) {
      absAjk = abs(A[j][k]);
      if (max < absAjk) {
        max = absAjk;
        Pk = j;
      }
    }
    P[k] = Pk;

    if (Pk != k) {
      A[k] = A[Pk];
      A[Pk] = Ak;
      Ak = A[k];
    }

    Akk = Ak[k];

    for (i = k + 1; i < n; ++i) {
      A[i][k] /= Akk;
    }

    for (i = k + 1; i < n; ++i) {
      Ai = A[i];
      for (j = k + 1; j < n1; ++j) {
        Ai[j] -= Ai[k] * Ak[j];
        ++j;
        Ai[j] -= Ai[k] * Ak[j];
      }
      if(j===n1) Ai[j] -= Ai[k] * Ak[j];
    }
  }

  return {
    LU: A,
    P:  P
  };
}

numeric.LUsolve = function LUsolve(LUP, b) {
  var i, j;
  var LU = LUP.LU;
  var n   = LU.length;
  var x = numeric.clone(b);
  var P   = LUP.P;
  var Pi, LUi, LUii, tmp;

  for (i=n-1;i!==-1;--i) x[i] = b[i];
  for (i = 0; i < n; ++i) {
    Pi = P[i];
    if (P[i] !== i) {
      tmp = x[i];
      x[i] = x[Pi];
      x[Pi] = tmp;
    }

    LUi = LU[i];
    for (j = 0; j < i; ++j) {
      x[i] -= x[j] * LUi[j];
    }
  }

  for (i = n - 1; i >= 0; --i) {
    LUi = LU[i];
    for (j = i + 1; j < n; ++j) {
      x[i] -= x[j] * LUi[j];
    }

    x[i] /= LUi[i];
  }

  return x;
}

numeric.solve = function solve(A,b,fast) { return numeric.LUsolve(numeric.LU(A,fast), b); }

// 12. Linear programming
numeric.echelonize = function echelonize(A) {
    var s = numeric.dim(A), m = s[0], n = s[1];
    var I = numeric.identity(m);
    var P = Array(m);
    var i,j,k,l,Ai,Ii,Z,a;
    var abs = Math.abs;
    var diveq = numeric.diveq;
    A = numeric.clone(A);
    for(i=0;i<m;++i) {
        k = 0;
        Ai = A[i];
        Ii = I[i];
        for(j=1;j<n;++j) if(abs(Ai[k])<abs(Ai[j])) k=j;
        P[i] = k;
        diveq(Ii,Ai[k]);
        diveq(Ai,Ai[k]);
        for(j=0;j<m;++j) if(j!==i) {
            Z = A[j]; a = Z[k];
            for(l=n-1;l!==-1;--l) Z[l] -= Ai[l]*a;
            Z = I[j];
            for(l=m-1;l!==-1;--l) Z[l] -= Ii[l]*a;
        }
    }
    return {I:I, A:A, P:P};
}

numeric.__solveLP = function __solveLP(c,A,b,tol,maxit,x,flag) {
    var sum = numeric.sum, log = numeric.log, mul = numeric.mul, sub = numeric.sub, dot = numeric.dot, div = numeric.div, add = numeric.add;
    var m = c.length, n = b.length,y;
    var unbounded = false, cb,i0=0;
    var alpha = 1.0;
    var f0,df0,AT = numeric.transpose(A), svd = numeric.svd,transpose = numeric.transpose,leq = numeric.leq, sqrt = Math.sqrt, abs = Math.abs;
    var muleq = numeric.muleq;
    var norm = numeric.norminf, any = numeric.any,min = Math.min;
    var all = numeric.all, gt = numeric.gt;
    var p = Array(m), A0 = Array(n),e=numeric.rep([n],1), H;
    var solve = numeric.solve, z = sub(b,dot(A,x)),count;
    var dotcc = dot(c,c);
    var g;
    for(count=i0;count<maxit;++count) {
        var i,j,d;
        for(i=n-1;i!==-1;--i) A0[i] = div(A[i],z[i]);
        var A1 = transpose(A0);
        for(i=m-1;i!==-1;--i) p[i] = (/*x[i]+*/sum(A1[i]));
        alpha = 0.25*abs(dotcc/dot(c,p));
        var a1 = 100*sqrt(dotcc/dot(p,p));
        if(!isFinite(alpha) || alpha>a1) alpha = a1;
        g = add(c,mul(alpha,p));
        H = dot(A1,A0);
        for(i=m-1;i!==-1;--i) H[i][i] += 1;
        d = solve(H,div(g,alpha),true);
        var t0 = div(z,dot(A,d));
        var t = 1.0;
        for(i=n-1;i!==-1;--i) if(t0[i]<0) t = min(t,-0.999*t0[i]);
        y = sub(x,mul(d,t));
        z = sub(b,dot(A,y));
        if(!all(gt(z,0))) return { solution: x, message: "", iterations: count };
        x = y;
        if(alpha<tol) return { solution: y, message: "", iterations: count };
        if(flag) {
            var s = dot(c,g), Ag = dot(A,g);
            unbounded = true;
            for(i=n-1;i!==-1;--i) if(s*Ag[i]<0) { unbounded = false; break; }
        } else {
            if(x[m-1]>=0) unbounded = false;
            else unbounded = true;
        }
        if(unbounded) return { solution: y, message: "Unbounded", iterations: count };
    }
    return { solution: x, message: "maximum iteration count exceeded", iterations:count };
}

numeric._solveLP = function _solveLP(c,A,b,tol,maxit) {
    var m = c.length, n = b.length,y;
    var sum = numeric.sum, log = numeric.log, mul = numeric.mul, sub = numeric.sub, dot = numeric.dot, div = numeric.div, add = numeric.add;
    var c0 = numeric.rep([m],0).concat([1]);
    var J = numeric.rep([n,1],-1);
    var A0 = numeric.blockMatrix([[A                   ,   J  ]]);
    var b0 = b;
    var y = numeric.rep([m],0).concat(Math.max(0,numeric.sup(numeric.neg(b)))+1);
    var x0 = numeric.__solveLP(c0,A0,b0,tol,maxit,y,false);
    var x = numeric.clone(x0.solution);
    x.length = m;
    var foo = numeric.inf(sub(b,dot(A,x)));
    if(foo<0) { return { solution: NaN, message: "Infeasible", iterations: x0.iterations }; }
    var ret = numeric.__solveLP(c, A, b, tol, maxit-x0.iterations, x, true);
    ret.iterations += x0.iterations;
    return ret;
};

numeric.solveLP = function solveLP(c,A,b,Aeq,beq,tol,maxit) {
    if(typeof maxit === "undefined") maxit = 1000;
    if(typeof tol === "undefined") tol = numeric.epsilon;
    if(typeof Aeq === "undefined") return numeric._solveLP(c,A,b,tol,maxit);
    var m = Aeq.length, n = Aeq[0].length, o = A.length;
    var B = numeric.echelonize(Aeq);
    var flags = numeric.rep([n],0);
    var P = B.P;
    var Q = [];
    var i;
    for(i=P.length-1;i!==-1;--i) flags[P[i]] = 1;
    for(i=n-1;i!==-1;--i) if(flags[i]===0) Q.push(i);
    var g = numeric.getRange;
    var I = numeric.linspace(0,m-1), J = numeric.linspace(0,o-1);
    var Aeq2 = g(Aeq,I,Q), A1 = g(A,J,P), A2 = g(A,J,Q), dot = numeric.dot, sub = numeric.sub;
    var A3 = dot(A1,B.I);
    var A4 = sub(A2,dot(A3,Aeq2)), b4 = sub(b,dot(A3,beq));
    var c1 = Array(P.length), c2 = Array(Q.length);
    for(i=P.length-1;i!==-1;--i) c1[i] = c[P[i]];
    for(i=Q.length-1;i!==-1;--i) c2[i] = c[Q[i]];
    var c4 = sub(c2,dot(c1,dot(B.I,Aeq2)));
    var S = numeric._solveLP(c4,A4,b4,tol,maxit);
    var x2 = S.solution;
    if(x2!==x2) return S;
    var x1 = dot(B.I,sub(beq,dot(Aeq2,x2)));
    var x = Array(c.length);
    for(i=P.length-1;i!==-1;--i) x[P[i]] = x1[i];
    for(i=Q.length-1;i!==-1;--i) x[Q[i]] = x2[i];
    return { solution: x, message:S.message, iterations: S.iterations };
}

numeric.MPStoLP = function MPStoLP(MPS) {
    if(MPS instanceof String) { MPS.split('\n'); }
    var state = 0;
    var states = ['Initial state','NAME','ROWS','COLUMNS','RHS','BOUNDS','ENDATA'];
    var n = MPS.length;
    var i,j,z,N=0,rows = {}, sign = [], rl = 0, vars = {}, nv = 0;
    var name;
    var c = [], A = [], b = [];
    function err(e) { throw new Error('MPStoLP: '+e+'\nLine '+i+': '+MPS[i]+'\nCurrent state: '+states[state]+'\n'); }
    for(i=0;i<n;++i) {
        z = MPS[i];
        var w0 = z.match(/\S*/g);
        var w = [];
        for(j=0;j<w0.length;++j) if(w0[j]!=="") w.push(w0[j]);
        if(w.length === 0) continue;
        for(j=0;j<states.length;++j) if(z.substr(0,states[j].length) === states[j]) break;
        if(j<states.length) {
            state = j;
            if(j===1) { name = w[1]; }
            if(j===6) return { name:name, c:c, A:numeric.transpose(A), b:b, rows:rows, vars:vars };
            continue;
        }
        switch(state) {
        case 0: case 1: err('Unexpected line');
        case 2: 
            switch(w[0]) {
            case 'N': if(N===0) N = w[1]; else err('Two or more N rows'); break;
            case 'L': rows[w[1]] = rl; sign[rl] = 1; b[rl] = 0; ++rl; break;
            case 'G': rows[w[1]] = rl; sign[rl] = -1;b[rl] = 0; ++rl; break;
            case 'E': rows[w[1]] = rl; sign[rl] = 0;b[rl] = 0; ++rl; break;
            default: err('Parse error '+numeric.prettyPrint(w));
            }
            break;
        case 3:
            if(!vars.hasOwnProperty(w[0])) { vars[w[0]] = nv; c[nv] = 0; A[nv] = numeric.rep([rl],0); ++nv; }
            var p = vars[w[0]];
            for(j=1;j<w.length;j+=2) {
                if(w[j] === N) { c[p] = parseFloat(w[j+1]); continue; }
                var q = rows[w[j]];
                A[p][q] = (sign[q]<0?-1:1)*parseFloat(w[j+1]);
            }
            break;
        case 4:
            for(j=1;j<w.length;j+=2) b[rows[w[j]]] = (sign[rows[w[j]]]<0?-1:1)*parseFloat(w[j+1]);
            break;
        case 5: /*FIXME*/ break;
        case 6: err('Internal error');
        }
    }
    err('Reached end of file without ENDATA');
}
// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow 
 * @param {number=} startdenom
 */

// Patched by Seb so that seedrandom.js does not pollute the Math object.
// My tests suggest that doing Math.trouble = 1 makes Math lookups about 5%
// slower.
numeric.seedrandom = { pow:Math.pow, random:Math.random };

(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
}(
  [],   // pool: entropy pool starts empty
  numeric.seedrandom, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
  ));
/* This file is a slightly modified version of quadprog.js from Alberto Santini.
 * It has been slightly modified by Sébastien Loisel to make sure that it handles
 * 0-based Arrays instead of 1-based Arrays.
 * License is in resources/LICENSE.quadprog */
(function(exports) {

function base0to1(A) {
    if(typeof A !== "object") { return A; }
    var ret = [], i,n=A.length;
    for(i=0;i<n;i++) ret[i+1] = base0to1(A[i]);
    return ret;
}
function base1to0(A) {
    if(typeof A !== "object") { return A; }
    var ret = [], i,n=A.length;
    for(i=1;i<n;i++) ret[i-1] = base1to0(A[i]);
    return ret;
}

function dpori(a, lda, n) {
    var i, j, k, kp1, t;

    for (k = 1; k <= n; k = k + 1) {
        a[k][k] = 1 / a[k][k];
        t = -a[k][k];
        //~ dscal(k - 1, t, a[1][k], 1);
        for (i = 1; i < k; i = i + 1) {
            a[i][k] = t * a[i][k];
        }

        kp1 = k + 1;
        if (n < kp1) {
            break;
        }
        for (j = kp1; j <= n; j = j + 1) {
            t = a[k][j];
            a[k][j] = 0;
            //~ daxpy(k, t, a[1][k], 1, a[1][j], 1);
            for (i = 1; i <= k; i = i + 1) {
                a[i][j] = a[i][j] + (t * a[i][k]);
            }
        }
    }

}

function dposl(a, lda, n, b) {
    var i, k, kb, t;

    for (k = 1; k <= n; k = k + 1) {
        //~ t = ddot(k - 1, a[1][k], 1, b[1], 1);
        t = 0;
        for (i = 1; i < k; i = i + 1) {
            t = t + (a[i][k] * b[i]);
        }

        b[k] = (b[k] - t) / a[k][k];
    }

    for (kb = 1; kb <= n; kb = kb + 1) {
        k = n + 1 - kb;
        b[k] = b[k] / a[k][k];
        t = -b[k];
        //~ daxpy(k - 1, t, a[1][k], 1, b[1], 1);
        for (i = 1; i < k; i = i + 1) {
            b[i] = b[i] + (t * a[i][k]);
        }
    }
}

function dpofa(a, lda, n, info) {
    var i, j, jm1, k, t, s;

    for (j = 1; j <= n; j = j + 1) {
        info[1] = j;
        s = 0;
        jm1 = j - 1;
        if (jm1 < 1) {
            s = a[j][j] - s;
            if (s <= 0) {
                break;
            }
            a[j][j] = Math.sqrt(s);
        } else {
            for (k = 1; k <= jm1; k = k + 1) {
                //~ t = a[k][j] - ddot(k - 1, a[1][k], 1, a[1][j], 1);
                t = a[k][j];
                for (i = 1; i < k; i = i + 1) {
                    t = t - (a[i][j] * a[i][k]);
                }
                t = t / a[k][k];
                a[k][j] = t;
                s = s + t * t;
            }
            s = a[j][j] - s;
            if (s <= 0) {
                break;
            }
            a[j][j] = Math.sqrt(s);
        }
        info[1] = 0;
    }
}

function qpgen2(dmat, dvec, fddmat, n, sol, crval, amat,
    bvec, fdamat, q, meq, iact, nact, iter, work, ierr) {

    var i, j, l, l1, info, it1, iwzv, iwrv, iwrm, iwsv, iwuv, nvl, r, iwnbv,
        temp, sum, t1, tt, gc, gs, nu,
        t1inf, t2min,
        vsmall, tmpa, tmpb,
        go;

    r = Math.min(n, q);
    l = 2 * n + (r * (r + 5)) / 2 + 2 * q + 1;

    vsmall = 1.0e-60;
    do {
        vsmall = vsmall + vsmall;
        tmpa = 1 + 0.1 * vsmall;
        tmpb = 1 + 0.2 * vsmall;
    } while (tmpa <= 1 || tmpb <= 1);

    for (i = 1; i <= n; i = i + 1) {
        work[i] = dvec[i];
    }
    for (i = n + 1; i <= l; i = i + 1) {
        work[i] = 0;
    }
    for (i = 1; i <= q; i = i + 1) {
        iact[i] = 0;
    }

    info = [];

    if (ierr[1] === 0) {
        dpofa(dmat, fddmat, n, info);
        if (info[1] !== 0) {
            ierr[1] = 2;
            return;
        }
        dposl(dmat, fddmat, n, dvec);
        dpori(dmat, fddmat, n);
    } else {
        for (j = 1; j <= n; j = j + 1) {
            sol[j] = 0;
            for (i = 1; i <= j; i = i + 1) {
                sol[j] = sol[j] + dmat[i][j] * dvec[i];
            }
        }
        for (j = 1; j <= n; j = j + 1) {
            dvec[j] = 0;
            for (i = j; i <= n; i = i + 1) {
                dvec[j] = dvec[j] + dmat[j][i] * sol[i];
            }
        }
    }

    crval[1] = 0;
    for (j = 1; j <= n; j = j + 1) {
        sol[j] = dvec[j];
        crval[1] = crval[1] + work[j] * sol[j];
        work[j] = 0;
        for (i = j + 1; i <= n; i = i + 1) {
            dmat[i][j] = 0;
        }
    }
    crval[1] = -crval[1] / 2;
    ierr[1] = 0;

    iwzv = n;
    iwrv = iwzv + n;
    iwuv = iwrv + r;
    iwrm = iwuv + r + 1;
    iwsv = iwrm + (r * (r + 1)) / 2;
    iwnbv = iwsv + q;

    for (i = 1; i <= q; i = i + 1) {
        sum = 0;
        for (j = 1; j <= n; j = j + 1) {
            sum = sum + amat[j][i] * amat[j][i];
        }
        work[iwnbv + i] = Math.sqrt(sum);
    }
    nact = 0;
    iter[1] = 0;
    iter[2] = 0;

    function fn_goto_50() {
        iter[1] = iter[1] + 1;

        l = iwsv;
        for (i = 1; i <= q; i = i + 1) {
            l = l + 1;
            sum = -bvec[i];
            for (j = 1; j <= n; j = j + 1) {
                sum = sum + amat[j][i] * sol[j];
            }
            if (Math.abs(sum) < vsmall) {
                sum = 0;
            }
            if (i > meq) {
                work[l] = sum;
            } else {
                work[l] = -Math.abs(sum);
                if (sum > 0) {
                    for (j = 1; j <= n; j = j + 1) {
                        amat[j][i] = -amat[j][i];
                    }
                    bvec[i] = -bvec[i];
                }
            }
        }

        for (i = 1; i <= nact; i = i + 1) {
            work[iwsv + iact[i]] = 0;
        }

        nvl = 0;
        temp = 0;
        for (i = 1; i <= q; i = i + 1) {
            if (work[iwsv + i] < temp * work[iwnbv + i]) {
                nvl = i;
                temp = work[iwsv + i] / work[iwnbv + i];
            }
        }
        if (nvl === 0) {
            return 999;
        }

        return 0;
    }

    function fn_goto_55() {
        for (i = 1; i <= n; i = i + 1) {
            sum = 0;
            for (j = 1; j <= n; j = j + 1) {
                sum = sum + dmat[j][i] * amat[j][nvl];
            }
            work[i] = sum;
        }

        l1 = iwzv;
        for (i = 1; i <= n; i = i + 1) {
            work[l1 + i] = 0;
        }
        for (j = nact + 1; j <= n; j = j + 1) {
            for (i = 1; i <= n; i = i + 1) {
                work[l1 + i] = work[l1 + i] + dmat[i][j] * work[j];
            }
        }

        t1inf = true;
        for (i = nact; i >= 1; i = i - 1) {
            sum = work[i];
            l = iwrm + (i * (i + 3)) / 2;
            l1 = l - i;
            for (j = i + 1; j <= nact; j = j + 1) {
                sum = sum - work[l] * work[iwrv + j];
                l = l + j;
            }
            sum = sum / work[l1];
            work[iwrv + i] = sum;
            if (iact[i] < meq) {
                // continue;
                break;
            }
            if (sum < 0) {
                // continue;
                break;
            }
            t1inf = false;
            it1 = i;
        }

        if (!t1inf) {
            t1 = work[iwuv + it1] / work[iwrv + it1];
            for (i = 1; i <= nact; i = i + 1) {
                if (iact[i] < meq) {
                    // continue;
                    break;
                }
                if (work[iwrv + i] < 0) {
                    // continue;
                    break;
                }
                temp = work[iwuv + i] / work[iwrv + i];
                if (temp < t1) {
                    t1 = temp;
                    it1 = i;
                }
            }
        }

        sum = 0;
        for (i = iwzv + 1; i <= iwzv + n; i = i + 1) {
            sum = sum + work[i] * work[i];
        }
        if (Math.abs(sum) <= vsmall) {
            if (t1inf) {
                ierr[1] = 1;
                // GOTO 999
                return 999;
            } else {
                for (i = 1; i <= nact; i = i + 1) {
                    work[iwuv + i] = work[iwuv + i] - t1 * work[iwrv + i];
                }
                work[iwuv + nact + 1] = work[iwuv + nact + 1] + t1;
                // GOTO 700
                return 700;
            }
        } else {
            sum = 0;
            for (i = 1; i <= n; i = i + 1) {
                sum = sum + work[iwzv + i] * amat[i][nvl];
            }
            tt = -work[iwsv + nvl] / sum;
            t2min = true;
            if (!t1inf) {
                if (t1 < tt) {
                    tt = t1;
                    t2min = false;
                }
            }

            for (i = 1; i <= n; i = i + 1) {
                sol[i] = sol[i] + tt * work[iwzv + i];
                if (Math.abs(sol[i]) < vsmall) {
                    sol[i] = 0;
                }
            }

            crval[1] = crval[1] + tt * sum * (tt / 2 + work[iwuv + nact + 1]);
            for (i = 1; i <= nact; i = i + 1) {
                work[iwuv + i] = work[iwuv + i] - tt * work[iwrv + i];
            }
            work[iwuv + nact + 1] = work[iwuv + nact + 1] + tt;

            if (t2min) {
                nact = nact + 1;
                iact[nact] = nvl;

                l = iwrm + ((nact - 1) * nact) / 2 + 1;
                for (i = 1; i <= nact - 1; i = i + 1) {
                    work[l] = work[i];
                    l = l + 1;
                }

                if (nact === n) {
                    work[l] = work[n];
                } else {
                    for (i = n; i >= nact + 1; i = i - 1) {
                        if (work[i] === 0) {
                            // continue;
                            break;
                        }
                        gc = Math.max(Math.abs(work[i - 1]), Math.abs(work[i]));
                        gs = Math.min(Math.abs(work[i - 1]), Math.abs(work[i]));
                        if (work[i - 1] >= 0) {
                            temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
                        } else {
                            temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
                        }
                        gc = work[i - 1] / temp;
                        gs = work[i] / temp;

                        if (gc === 1) {
                            // continue;
                            break;
                        }
                        if (gc === 0) {
                            work[i - 1] = gs * temp;
                            for (j = 1; j <= n; j = j + 1) {
                                temp = dmat[j][i - 1];
                                dmat[j][i - 1] = dmat[j][i];
                                dmat[j][i] = temp;
                            }
                        } else {
                            work[i - 1] = temp;
                            nu = gs / (1 + gc);
                            for (j = 1; j <= n; j = j + 1) {
                                temp = gc * dmat[j][i - 1] + gs * dmat[j][i];
                                dmat[j][i] = nu * (dmat[j][i - 1] + temp) - dmat[j][i];
                                dmat[j][i - 1] = temp;

                            }
                        }
                    }
                    work[l] = work[nact];
                }
            } else {
                sum = -bvec[nvl];
                for (j = 1; j <= n; j = j + 1) {
                    sum = sum + sol[j] * amat[j][nvl];
                }
                if (nvl > meq) {
                    work[iwsv + nvl] = sum;
                } else {
                    work[iwsv + nvl] = -Math.abs(sum);
                    if (sum > 0) {
                        for (j = 1; j <= n; j = j + 1) {
                            amat[j][nvl] = -amat[j][nvl];
                        }
                        bvec[nvl] = -bvec[nvl];
                    }
                }
                // GOTO 700
                return 700;
            }
        }

        return 0;
    }

    function fn_goto_797() {
        l = iwrm + (it1 * (it1 + 1)) / 2 + 1;
        l1 = l + it1;
        if (work[l1] === 0) {
            // GOTO 798
            return 798;
        }
        gc = Math.max(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
        gs = Math.min(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
        if (work[l1 - 1] >= 0) {
            temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
        } else {
            temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
        }
        gc = work[l1 - 1] / temp;
        gs = work[l1] / temp;

        if (gc === 1) {
            // GOTO 798
            return 798;
        }
        if (gc === 0) {
            for (i = it1 + 1; i <= nact; i = i + 1) {
                temp = work[l1 - 1];
                work[l1 - 1] = work[l1];
                work[l1] = temp;
                l1 = l1 + i;
            }
            for (i = 1; i <= n; i = i + 1) {
                temp = dmat[i][it1];
                dmat[i][it1] = dmat[i][it1 + 1];
                dmat[i][it1 + 1] = temp;
            }
        } else {
            nu = gs / (1 + gc);
            for (i = it1 + 1; i <= nact; i = i + 1) {
                temp = gc * work[l1 - 1] + gs * work[l1];
                work[l1] = nu * (work[l1 - 1] + temp) - work[l1];
                work[l1 - 1] = temp;
                l1 = l1 + i;
            }
            for (i = 1; i <= n; i = i + 1) {
                temp = gc * dmat[i][it1] + gs * dmat[i][it1 + 1];
                dmat[i][it1 + 1] = nu * (dmat[i][it1] + temp) - dmat[i][it1 + 1];
                dmat[i][it1] = temp;
            }
        }

        return 0;
    }

    function fn_goto_798() {
        l1 = l - it1;
        for (i = 1; i <= it1; i = i + 1) {
            work[l1] = work[l];
            l = l + 1;
            l1 = l1 + 1;
        }

        work[iwuv + it1] = work[iwuv + it1 + 1];
        iact[it1] = iact[it1 + 1];
        it1 = it1 + 1;
        if (it1 < nact) {
            // GOTO 797
            return 797;
        }

        return 0;
    }

    function fn_goto_799() {
        work[iwuv + nact] = work[iwuv + nact + 1];
        work[iwuv + nact + 1] = 0;
        iact[nact] = 0;
        nact = nact - 1;
        iter[2] = iter[2] + 1;

        return 0;
    }

    go = 0;
    while (true) {
        go = fn_goto_50();
        if (go === 999) {
            return;
        }
        while (true) {
            go = fn_goto_55();
            if (go === 0) {
                break;
            }
            if (go === 999) {
                return;
            }
            if (go === 700) {
                if (it1 === nact) {
                    fn_goto_799();
                } else {
                    while (true) {
                        fn_goto_797();
                        go = fn_goto_798();
                        if (go !== 797) {
                            break;
                        }
                    }
                    fn_goto_799();
                }
            }
        }
    }

}

function solveQP(Dmat, dvec, Amat, bvec, meq, factorized) {
    Dmat = base0to1(Dmat);
    dvec = base0to1(dvec);
    Amat = base0to1(Amat);
    var i, n, q,
        nact, r,
        crval = [], iact = [], sol = [], work = [], iter = [],
        message;

    meq = meq || 0;
    factorized = factorized ? base0to1(factorized) : [undefined, 0];
    bvec = bvec ? base0to1(bvec) : [];

    // In Fortran the array index starts from 1
    n = Dmat.length - 1;
    q = Amat[1].length - 1;

    if (!bvec) {
        for (i = 1; i <= q; i = i + 1) {
            bvec[i] = 0;
        }
    }
    for (i = 1; i <= q; i = i + 1) {
        iact[i] = 0;
    }
    nact = 0;
    r = Math.min(n, q);
    for (i = 1; i <= n; i = i + 1) {
        sol[i] = 0;
    }
    crval[1] = 0;
    for (i = 1; i <= (2 * n + (r * (r + 5)) / 2 + 2 * q + 1); i = i + 1) {
        work[i] = 0;
    }
    for (i = 1; i <= 2; i = i + 1) {
        iter[i] = 0;
    }

    qpgen2(Dmat, dvec, n, n, sol, crval, Amat,
        bvec, n, q, meq, iact, nact, iter, work, factorized);

    message = "";
    if (factorized[1] === 1) {
        message = "constraints are inconsistent, no solution!";
    }
    if (factorized[1] === 2) {
        message = "matrix D in quadratic function is not positive definite!";
    }

    return {
        solution: base1to0(sol),
        value: base1to0(crval),
        unconstrained_solution: base1to0(dvec),
        iterations: base1to0(iter),
        iact: base1to0(iact),
        message: message
    };
}
exports.solveQP = solveQP;
}(numeric));
/*
Shanti Rao sent me this routine by private email. I had to modify it
slightly to work on Arrays instead of using a Matrix object.
It is apparently translated from http://stitchpanorama.sourceforge.net/Python/svd.py
*/

numeric.svd= function svd(A) {
    var temp;
//Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
	var prec= numeric.epsilon; //Math.pow(2,-52) // assumes double prec
	var tolerance= 1.e-64/prec;
	var itmax= 50;
	var c=0;
	var i=0;
	var j=0;
	var k=0;
	var l=0;
	
	var u= numeric.clone(A);
	var m= u.length;
	
	var n= u[0].length;
	
	if (m < n) throw "Need more rows than columns"
	
	var e = new Array(n);
	var q = new Array(n);
	for (i=0; i<n; i++) e[i] = q[i] = 0.0;
	var v = numeric.rep([n,n],0);
//	v.zero();
	
 	function pythag(a,b)
 	{
		a = Math.abs(a)
		b = Math.abs(b)
		if (a > b)
			return a*Math.sqrt(1.0+(b*b/a/a))
		else if (b == 0.0) 
			return a
		return b*Math.sqrt(1.0+(a*a/b/b))
	}

	//Householder's reduction to bidiagonal form

	var f= 0.0;
	var g= 0.0;
	var h= 0.0;
	var x= 0.0;
	var y= 0.0;
	var z= 0.0;
	var s= 0.0;
	
	for (i=0; i < n; i++)
	{	
		e[i]= g;
		s= 0.0;
		l= i+1;
		for (j=i; j < m; j++) 
			s += (u[j][i]*u[j][i]);
		if (s <= tolerance)
			g= 0.0;
		else
		{	
			f= u[i][i];
			g= Math.sqrt(s);
			if (f >= 0.0) g= -g;
			h= f*g-s
			u[i][i]=f-g;
			for (j=l; j < n; j++)
			{
				s= 0.0
				for (k=i; k < m; k++) 
					s += u[k][i]*u[k][j]
				f= s/h
				for (k=i; k < m; k++) 
					u[k][j]+=f*u[k][i]
			}
		}
		q[i]= g
		s= 0.0
		for (j=l; j < n; j++) 
			s= s + u[i][j]*u[i][j]
		if (s <= tolerance)
			g= 0.0
		else
		{	
			f= u[i][i+1]
			g= Math.sqrt(s)
			if (f >= 0.0) g= -g
			h= f*g - s
			u[i][i+1] = f-g;
			for (j=l; j < n; j++) e[j]= u[i][j]/h
			for (j=l; j < m; j++)
			{	
				s=0.0
				for (k=l; k < n; k++) 
					s += (u[j][k]*u[i][k])
				for (k=l; k < n; k++) 
					u[j][k]+=s*e[k]
			}	
		}
		y= Math.abs(q[i])+Math.abs(e[i])
		if (y>x) 
			x=y
	}
	
	// accumulation of right hand gtransformations
	for (i=n-1; i != -1; i+= -1)
	{	
		if (g != 0.0)
		{
		 	h= g*u[i][i+1]
			for (j=l; j < n; j++) 
				v[j][i]=u[i][j]/h
			for (j=l; j < n; j++)
			{	
				s=0.0
				for (k=l; k < n; k++) 
					s += u[i][k]*v[k][j]
				for (k=l; k < n; k++) 
					v[k][j]+=(s*v[k][i])
			}	
		}
		for (j=l; j < n; j++)
		{
			v[i][j] = 0;
			v[j][i] = 0;
		}
		v[i][i] = 1;
		g= e[i]
		l= i
	}
	
	// accumulation of left hand transformations
	for (i=n-1; i != -1; i+= -1)
	{	
		l= i+1
		g= q[i]
		for (j=l; j < n; j++) 
			u[i][j] = 0;
		if (g != 0.0)
		{
			h= u[i][i]*g
			for (j=l; j < n; j++)
			{
				s=0.0
				for (k=l; k < m; k++) s += u[k][i]*u[k][j];
				f= s/h
				for (k=i; k < m; k++) u[k][j]+=f*u[k][i];
			}
			for (j=i; j < m; j++) u[j][i] = u[j][i]/g;
		}
		else
			for (j=i; j < m; j++) u[j][i] = 0;
		u[i][i] += 1;
	}
	
	// diagonalization of the bidiagonal form
	prec= prec*x
	for (k=n-1; k != -1; k+= -1)
	{
		for (var iteration=0; iteration < itmax; iteration++)
		{	// test f splitting
			var test_convergence = false
			for (l=k; l != -1; l+= -1)
			{	
				if (Math.abs(e[l]) <= prec)
				{	test_convergence= true
					break 
				}
				if (Math.abs(q[l-1]) <= prec)
					break 
			}
			if (!test_convergence)
			{	// cancellation of e[l] if l>0
				c= 0.0
				s= 1.0
				var l1= l-1
				for (i =l; i<k+1; i++)
				{	
					f= s*e[i]
					e[i]= c*e[i]
					if (Math.abs(f) <= prec)
						break
					g= q[i]
					h= pythag(f,g)
					q[i]= h
					c= g/h
					s= -f/h
					for (j=0; j < m; j++)
					{	
						y= u[j][l1]
						z= u[j][i]
						u[j][l1] =  y*c+(z*s)
						u[j][i] = -y*s+(z*c)
					} 
				}	
			}
			// test f convergence
			z= q[k]
			if (l== k)
			{	//convergence
				if (z<0.0)
				{	//q[k] is made non-negative
					q[k]= -z
					for (j=0; j < n; j++)
						v[j][k] = -v[j][k]
				}
				break  //break out of iteration loop and move on to next k value
			}
			if (iteration >= itmax-1)
				throw 'Error: no convergence.'
			// shift from bottom 2x2 minor
			x= q[l]
			y= q[k-1]
			g= e[k-1]
			h= e[k]
			f= ((y-z)*(y+z)+(g-h)*(g+h))/(2.0*h*y)
			g= pythag(f,1.0)
			if (f < 0.0)
				f= ((x-z)*(x+z)+h*(y/(f-g)-h))/x
			else
				f= ((x-z)*(x+z)+h*(y/(f+g)-h))/x
			// next QR transformation
			c= 1.0
			s= 1.0
			for (i=l+1; i< k+1; i++)
			{	
				g= e[i]
				y= q[i]
				h= s*g
				g= c*g
				z= pythag(f,h)
				e[i-1]= z
				c= f/z
				s= h/z
				f= x*c+g*s
				g= -x*s+g*c
				h= y*s
				y= y*c
				for (j=0; j < n; j++)
				{	
					x= v[j][i-1]
					z= v[j][i]
					v[j][i-1] = x*c+z*s
					v[j][i] = -x*s+z*c
				}
				z= pythag(f,h)
				q[i-1]= z
				c= f/z
				s= h/z
				f= c*g+s*y
				x= -s*g+c*y
				for (j=0; j < m; j++)
				{
					y= u[j][i-1]
					z= u[j][i]
					u[j][i-1] = y*c+z*s
					u[j][i] = -y*s+z*c
				}
			}
			e[l]= 0.0
			e[k]= f
			q[k]= x
		} 
	}
		
	//vt= transpose(v)
	//return (u,q,vt)
	for (i=0;i<q.length; i++) 
	  if (q[i] < prec) q[i] = 0
	  
	//sort eigenvalues	
	for (i=0; i< n; i++)
	{	 
	//writeln(q)
	 for (j=i-1; j >= 0; j--)
	 {
	  if (q[j] < q[i])
	  {
	//  writeln(i,'-',j)
	   c = q[j]
	   q[j] = q[i]
	   q[i] = c
	   for(k=0;k<u.length;k++) { temp = u[k][i]; u[k][i] = u[k][j]; u[k][j] = temp; }
	   for(k=0;k<v.length;k++) { temp = v[k][i]; v[k][i] = v[k][j]; v[k][j] = temp; }
//	   u.swapCols(i,j)
//	   v.swapCols(i,j)
	   i = j	   
	  }
	 }	
	}
	
	return {U:u,S:q,V:v}
};



class BusinessHours {
	static apply(startDate, endDate, workingHours=null, weekends=null) {
		if (workingHours == null) {
			workingHours = BusinessHours.DEFAULT_WORKING_HOURS;
		}
		
		if (weekends == null) {
			weekends = BusinessHours.DEFAULT_WEEKENDS;
		}
		
		// Store minutes worked
		var minutesWorked = 0;
	  
		// Validate input
		if (endDate < startDate) { return 0; }
		
		// Loop from your Start to End dates (by hour)
		var current = startDate;

		// Loop while currentDate is less than end Date (by minutes)
		while(current < endDate){          
			// Is the current time within a work day (and if it occurs on a weekend or not)          
			if(current.getHours() >= workingHours[0] && current.getHours() <= workingHours[1] 
			   && !(weekends.includes(current.getDay()))) {
				  minutesWorked++;
			}
			 
			// Increment current time
			current.setTime(current.getTime() + 1000 * 60);
		}

		// Return the number of seconds
		return minutesWorked * 60;
	}
}

BusinessHours.DEFAULT_WORKING_HOURS = [7, 17];
BusinessHours.DEFAULT_WEEKENDS = [0, 6];
BusinessHours.ENABLED = false;

try {
	require('../../pm4js.js');
	global.BusinessHours = BusinessHours;
	module.exports = {BusinessHours: BusinessHours};
}
catch (err) {
	// not in Node
	//console.log(err);
}


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
				if (activityKey in trace.events[0].attributes) {
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
		}
		return ret;
	}
	
	static getEndActivities(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				if (activityKey in trace.events[trace.events.length-1].attributes) {
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
		}
		return ret;
	}
	
	static getAttributeValues(log, attributeKey) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				if (attributeKey in eve.attributes) {
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
		}
		return ret;
	}
	
	static getTraceAttributeValues(log, attributeKey) {
		let ret = {};
		for (let trace of log.traces) {
			if (attributeKey in trace.attributes) {
				let val = trace.attributes[attributeKey].value;
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
				if (activityKey in eve.attributes) {
					let act = eve.attributes[activityKey].value;
					activities.push(act);
				}
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
	
	static getEventAttributesWithType(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				for (let attr in eve.attributes) {
					if (!(attr in ret)) {
						ret[attr] = typeof eve.attributes[attr].value;
					}
				}
			}
		}
		return ret;
	}
	
	static getTraceAttributesWithType(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let attr in trace.attributes) {
				ret[attr] = typeof trace.attributes[attr].value;
			}
		}
		return ret;
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
				if (activityKey in eve.attributes && startTimestamp in eve.attributes && completeTimestamp in eve.attributes) {
					let acti = eve.attributes[activityKey].value;
					if (!(acti in sojTime)) {
						sojTime[acti] = [];
					}
					let st = eve.attributes[startTimestamp].value;
					let et = eve.attributes[completeTimestamp].value;
					let diff = 0;
					if (BusinessHours.ENABLED) {
						diff = BusinessHours.apply(st, et);
					}
					else {
						st = st.getTime();
						et = et.getTime();
						diff = (et - st)*1000;
					}
					sojTime[acti].push(diff);
				}
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
	
	static resourceActivityPattern(eventLog, activityKey="concept:name", resourceKey="org:resource") {
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, activityKey));
		let resources = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, resourceKey));
		let resActPatt = {};
		for (let res of resources) {
			resActPatt[res] = [];
			for (let act of activities) {
				resActPatt[res].push(0);
			}
		}
		for (let trace of eventLog.traces) {
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey];
				let res = eve.attributes[resourceKey];
				if (act != null && res != null) {
					act = act.value;
					res = res.value;
					resActPatt[res][activities.indexOf(act)] += 1;
				}
			}
		}
		return {"resActPatt": resActPatt, "activities": activities};
	}
	
	static activityResourcePattern(eventLog, activityKey="concept:name", resourceKey="org:resource") {
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, activityKey));
		let resources = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, resourceKey));
		let actResPatt = {};
		for (let act of activities) {
			actResPatt[act] = [];
			for (let res of resources) {
				actResPatt[act].push(0);
			}
		}
		for (let trace of eventLog.traces) {
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey];
				let res = eve.attributes[resourceKey];
				if (act != null && res != null) {
					act = act.value;
					res = res.value;
					actResPatt[act][resources.indexOf(res)] += 1;
				}
			}
		}
		return {"actResPatt": actResPatt, "resources": resources}
	}
	
	static subcontracting(eventLog, resourceKey="org:resource") {
		let subc = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length - 2) {
				let ri = trace.events[i].attributes[resourceKey];
				let ri1 = trace.events[i+1].attributes[resourceKey];
				let ri2 = trace.events[i+2].attributes[resourceKey];
				if (ri != null && ri1 != null && ri2 != null) {
					ri = ri.value;
					ri1 = ri1.value;
					ri2 = ri2.value;
					if (ri != ri1 && ri == ri2) {
						// subcontracting happens
						if (!(ri in subc)) {
							subc[ri] = {};
						}
						if (!(ri1 in subc[ri])) {
							subc[ri][ri1] = [];
						}
						subc[ri][ri1].push([trace, i, i+2]);
					}
				}
				i++;
			}
		}
		return subc;
	}
	
	static workingTogether(eventLog, resourceKey="org:resource") {
		let wt = {};
		for (let trace of eventLog.traces) {
			let originators = {};
			for (let eve of trace.events) {
				let res = eve.attributes[resourceKey];
				if (res != null) {
					res = res.value;
					originators[res] = 0;
				}
			}
			for (let res1 in originators) {
				for (let res2 in originators) {
					if (res1 != res2) {
						if (!(res1 in wt)) {
							wt[res1] = {};
						}
						if (!(res2 in wt)) {
							wt[res2] = {};
						}
						if (!(res2 in wt[res1])) {
							wt[res1][res2] = 0;
						}
						if (!(res1 in wt[res2])) {
							wt[res2][res1] = 0;
						}
						wt[res1][res2] += 1;
						wt[res2][res1] += 1;
					}
				}
			}
		}
		return wt;
	}
	
	static activitiesOccurrencesPerCase(eventLog, activityKey="concept:name") {
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, activityKey));
		let occurrences = {};
		for (let act of activities) {
			occurrences[act] = [];
		}
		for (let trace of eventLog.traces) {
			let occ = {};
			for (let eve of trace.events) {
				let activity = eve.attributes[activityKey];
				if (activity != null) {
					activity = activity.value;
					if (!(activity in occ)) {
						occ[activity] = 0;
					}
					occ[activity] += 1;
				}
			}
			for (let act of activities) {
				if (act in occ) {
					occurrences[act].push(occ[act]);
				}
				else {
					occurrences[act].push(0);
				}
			}
		}
		return occurrences;
	}
	
	static projectOnAttributeValues(eventLog, attributeKey="concept:name") {
		let ret = [];
		for (let trace of eventLog.traces) {
			let arr = [];
			for (let eve of trace.events) {
				let val = eve.attributes[attributeKey];
				if (val != null) {
					arr.push(val.value);
				}
				else {
					arr.push(null);
				}
			}
			ret.push(arr);
		}
		return ret;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {GeneralLogStatistics: GeneralLogStatistics};
	global.GeneralLogStatistics = GeneralLogStatistics;
}
catch (err) {
	// not in node
	//console.log(err);
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
	//console.log(err);
}

//Pm4JS.registerImporter("CsvImporter", "apply", ["csv"], "CSV Importer", "Alessandro Berti");

class CsvExporter {
	static apply(eventLog, sep=CsvExporter.DEFAULT_SEPARATOR, quotechar=CsvExporter.DEFAULT_QUOTECHAR, casePrefix=CsvExporter.DEFAULT_CASE_PREFIX, newline=CsvExporter.DEFAULT_NEWLINE) {
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
						//pref += val.toISOString()+sep;
						pref += DateUtils.formatDateString(val)+sep;
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
							//eveStr += val.toISOString()+sep;
							eveStr += DateUtils.formatDateString(val)+sep;
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
		ret = ret.join(newline);
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
CsvExporter.DEFAULT_NEWLINE = '\n';

try {
	require('../../../../pm4js.js');
	require('../../log.js');
	require('../../../../statistics/log/general.js');
	module.exports = {CsvExporter: CsvExporter};
	global.CsvExporter = CsvExporter;
}
catch (err) {
	// not in node
	//console.log(err);
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
	require('../../../../pm4js.js');
	require('../../log.js');
	module.exports = {XesExporter: XesExporter};
	global.XesExporter = XesExporter;
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
}
catch (err) {
	// not in node
	//console.log(err);
}

Pm4JS.registerExporter("XesExporter", "apply", "EventLog", "xes", "text/xml", "XES Exporter", "Alessandro Berti");

class PetriNet {
	constructor(name="EMPTY") {
		this.name = name;
		this.places = {};
		this.transitions = {};
		this.arcs = {};
		this.associatedTime = 0;
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
		this.associatedTime = 0;
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
	
	execute(transition, associatedTime=null) {
		let newMarking = new Marking(this.net);
		for (let place in this.tokens) {
			newMarking.setTokens(place, this.tokens[place]);
		}
		let preMarking = transition.getPreMarking();
		let postMarking = transition.getPostMarking();
		let transObj = this.net.transitions[transition];
		if (associatedTime != null) {
			transObj.associatedTime = associatedTime;
		}
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
			if (associatedTime != null) {
				let placeObj = this.net.places[place];
				placeObj.associatedTime = associatedTime;
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
	
	setAssociatedTimest(timest) {
		for (let placeId in this.tokens) {
			let place = this.net.places[placeId];
			place.associatedTime = timest;
		}
	}
	
	getAssociatedTimest() {
		let maxTime = 0;
		for (let placeId in this.tokens) {
			let place = this.net.places[placeId];
			maxTime = Math.max(place.associatedTime, maxTime);
		}
		return maxTime;
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
				//if (Object.keys(sourcePlace.inArcs).length > 0 && Object.keys(sourcePlace.outArcs).length == 1) {
					for (let arcId in sourcePlace.inArcs) {
						let sourceTransition = sourcePlace.inArcs[arcId].source;
						for (let p of targetPlaces) {
							net.addArcFromTo(sourceTransition, p);
						}
					}
					net.removeTransition(trans);
					net.removePlace(sourcePlace);
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
				//if (Object.keys(targetPlace.inArcs).length == 1 && Object.keys(targetPlace.outArcs).length > 0) {
					for (let arcId in targetPlace.outArcs) {
						let targetTransition = targetPlace.outArcs[arcId].target;
						for (let p of sourcePlaces) {
							net.addArcFromTo(p, targetTransition);
						}
					}
					net.removeTransition(trans);
					net.removePlace(targetPlace);
					cont = true;
					break;
				}
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PetriNetReduction: PetriNetReduction};
	global.PetriNetReduction = PetriNetReduction;
}
catch (err) {
	//console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("PetriNetReduction", "apply", ["AcceptingPetriNet"], "AcceptingPetriNet", "SESE Reduction of Accepting Petri Net", "Alessandro Berti");


class PetriNetReachableVisibleTransitions {
	static apply(net, marking) {
		let reachableVisibleTransitions = {};
		let visited = {};
		let toVisit = [];
		toVisit.push(marking);
		while (toVisit.length > 0) {
			//console.log(reachableVisibleTransitions);
			let currMarking = toVisit.shift();
			if (currMarking in visited) {
				continue;
			}
			visited[currMarking] = 0;
			let enabledTransitions = currMarking.getEnabledTransitions();
			for (let trans of enabledTransitions) {
				if (trans.label != null) {
					reachableVisibleTransitions[trans.label] = 0;
				}
				else {
					let newMarking = currMarking.execute(trans);
					if (!(newMarking in visited)) {
						toVisit.push(newMarking);
					}
				}
			}
		}
		return Object.keys(reachableVisibleTransitions);
	}
}

try {
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PetriNetReachableVisibleTransitions: PetriNetReachableVisibleTransitions};
	global.PetriNetReachableVisibleTransitions = PetriNetReachableVisibleTransitions;
}
catch (err) {
	//console.log(err);
	// not in Node
}


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
	//console.log(err);
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
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PnmlExporter: PnmlExporter};
	global.PnmlExporter = PnmlExporter;
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
}
catch (err) {
	// not in node
	//console.log(err);
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
		this.properties = {};
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
	//console.log(err);
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
	require('../../petri_net/util/reduction.js');
	module.exports = {ProcessTreeToPetriNetConverter: ProcessTreeToPetriNetConverter};
	global.ProcessTreeToPetriNetConverter = ProcessTreeToPetriNetConverter;
}
catch (err) {
	//console.log(err);
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
	//console.log(err);
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
	//console.log(err);
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
				if (activityKey in eve.attributes) {
					varArray.push(eve.attributes[activityKey].value);
				}
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
				if (attributeKey in eve.attributes) {
					let val = eve.attributes[attributeKey].value;
					bo = bo || valuesArray.includes(val);
				}
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
				if (attributeKey in eve.attributes) {
					let val = eve.attributes[attributeKey].value;
					let bo = valuesArray.includes(val);
					if ((bo && positive) || (!bo && !positive)) {
						newTrace.events.push(eve);
					}
				}
			}
			if (addEvenIfEmpty || newTrace.events.length > 0) {
				filteredLog.traces.push(newTrace);
			}
		}
		return filteredLog;
	}
	
	static filterRework(log, activity, minOccurrences, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let actOcc = {};
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey];
				if (act != null) {
					act = act.value;
					if (!(act in actOcc)) {
						actOcc[act] = 0;
					}
					actOcc[act] += 1;
				}
			}
			if (activity in actOcc && actOcc[activity] >= minOccurrences) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterBetween(log, activity1, activity2, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let a1Idx = -1;
			let i = 0;
			while (i < trace.events.length) {
				let eve = trace.events[i];
				let act = eve.attributes[activityKey];
				if (act != null) {
					act = act.value;
					if (act == activity1) {
						a1Idx = i;
					}
					else if (act == activity2 && a1Idx > -1) {
						let newTrace = new Trace();
						let j = a1Idx;
						while (j <= i) {
							newTrace.events.push(trace.events[j]);
							j++;
						}
						filteredLog.traces.push(newTrace);
						a1Idx = -1;
					}
				}
				i++;
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

class LtlFiltering {
	static fourEyesPrinciple(log0, activity1, activity2, positive=false, activityKey="concept:name", resourceKey="org:resource") {
		let log = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log0, [activity1, activity2], true, true, activityKey);
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - 1) {
				if (trace.events[i].attributes[activityKey].value == activity1 && trace.events[i+1].attributes[activityKey].value == activity2) {
					if (!(positive) && (trace.events[i].attributes[resourceKey].value == trace.events[i+1].attributes[resourceKey].value)) {
						bo = true;
					}
					else if (positive && (trace.events[i].attributes[resourceKey].value != trace.events[i+1].attributes[resourceKey].value)) {
						bo = true;
					}
				}
				i++;
			}
			if (bo) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
	
	static eventuallyFollowsFilter(log0, activities, positive=true, activityKey="concept:name") {
		let activitiesJoin = activities.join(",");
		let log = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log0, activities, true, true, activityKey);
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - activities.length + 1) {
				let currActivities = [];
				let z = i;
				while (z < trace.events.length) {
					currActivities.push(trace.events[z].attributes[activityKey].value);
					z++;
				}
				let currActivitiesJoin = currActivities.join(",");
				if (activitiesJoin == currActivitiesJoin) {
					bo = true;
					break;
				}
				i++;
			}
			if ((positive && bo) || !(positive || bo)) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
	
	static directlyFollowsFilter(log0, activities, positive=true, activityKey="concept:name") {
		let activitiesJoin = activities.join(",");
		let log = log0;
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - activities.length + 1) {
				let currActivities = [];
				let z = i;
				while (z < trace.events.length) {
					currActivities.push(trace.events[z].attributes[activityKey].value);
					z++;
				}
				let currActivitiesJoin = currActivities.join(",");
				if (activitiesJoin == currActivitiesJoin) {
					bo = true;
					break;
				}
				i++;
			}
			if ((positive && bo) || !(positive || bo)) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
	
	static activityDoneDifferentResources(log0, activity, positive=true, activityKey="concept:name", resourceKey="org:resource") {
		let log = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log0, [activity], true, true, activityKey);
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - 1) {
				if (trace.events[i].attributes[resourceKey].value != trace.events[i+1].attributes[resourceKey].value) {
					bo = true;
					break;
				}
				i++;
			}
			if ((positive && bo) || !(positive || bo)) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {LtlFiltering: LtlFiltering};
	global.LtlFiltering = LtlFiltering;
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
	//console.log(err);
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
		this.transExecutionPerformance = {};
		for (let t in acceptingPetriNet.net.transitions) {
			this.transExecutions[t] = 0;
			this.transExecutionPerformance[t] = [];
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
		this.averageTraceFitness = 0.0;
		this.percentageFitTraces = 0.0;
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
			for (let t of res["visitedTransitions"]) {
				this.transExecutions[t]++;
				for (let a in t.inArcs) {
					this.arcExecutions[a]++;
				}
				for (let a in t.outArcs) {
					this.arcExecutions[a]++;
				}
			}
			let i = 0;
			while (i < res["visitedTransitions"].length) {
				let trans = res["visitedTransitions"][i];
				let transTime = res["visitedTransitionsTimes"][i];
				let markTime = res["visitedMarkingsTimes"][i];
				this.transExecutionPerformance[trans].push((transTime - markTime));
				i = i + 1;
			}
			for (let p in this.acceptingPetriNet.net.places) {
				this.totalConsumedPerPlace[p] += res["consumedPerPlace"][p];
				this.totalProducedPerPlace[p] += res["producedPerPlace"][p];
				this.totalMissingPerPlace[p] += res["missingPerPlace"][p];
				this.totalRemainingPerPlace[p] += res["remainingPerPlace"][p];
			}
			this.averageTraceFitness += res["fitness"];
		}
		let fitMC = 0.0;
		let fitRP = 0.0;
		if (this.totalConsumed > 0) {
			fitMC = 1.0 - this.totalMissing / this.totalConsumed;
		}
		if (this.totalProduced > 0) {
			fitRP = 1.0 - this.totalRemaining / this.totalProduced;
		}
		this.logFitness = 0.5*fitMC + 0.5*fitRP;
		this.averageTraceFitness = this.averageTraceFitness / this.result.length;
		this.percentageFitTraces = this.fitTraces / this.totalTraces;
	}
}

class TokenBasedReplay {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name", reachFm=true, oneReplayPerTrace=true, timestampKey="time:timestamp") {
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
			let arrTimestamp = TokenBasedReplay.getArrTimestamp(trace, timestampKey);
			if (oneReplayPerTrace && arrActivities in dictioResultsVariant) {
				ret.push(dictioResultsVariant[arrActivities]);
			}
			else {
				let thisRes = TokenBasedReplay.performTbr(arrActivities, transitionsMap, acceptingPetriNet, invisibleChain, reachFm, arrTimestamp);
				dictioResultsVariant[arrActivities] = thisRes;
				ret.push(thisRes);
			}
		}
		let finalResult = new TokenBasedReplayResult(ret, acceptingPetriNet);
		
		Pm4JS.registerObject(finalResult, "Token-Based Replay Result");
		
		return finalResult;
	}
	
	static applyListListAct(listListActivities, acceptingPetriNet, reachFm=true, retMarking=false) {
		let invisibleChain = TokenBasedReplay.buildInvisibleChain(acceptingPetriNet.net);
		let transitionsMap = {};
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			if (trans.label != null) {
				transitionsMap[trans.label] = trans;
			}
		}
		let ret = [];
		for (let activities of listListActivities) {
			let arrTimestamp = [];
			for (let act of activities) {
				arrTimestamp.push(0);
			}
			let tbrResult = TokenBasedReplay.performTbr(activities.split(","), transitionsMap, acceptingPetriNet, invisibleChain, reachFm, arrTimestamp);
			if (retMarking) {
				let isFit = tbrResult.isFit;
				tbrResult = tbrResult.visitedMarkings;
				tbrResult = tbrResult[tbrResult.length - 1];
				tbrResult.isFit = isFit;
			}
			ret.push(tbrResult);
		}
		return ret;
	}
	
	static performTbr(activities, transitionsMap, acceptingPetriNet, invisibleChain, reachFm, arrTimestamp) {
		let marking = acceptingPetriNet.im.copy();
		let currTimestamp = arrTimestamp[0];
		if (arrTimestamp.length > 0) {
			marking.setAssociatedTimest(currTimestamp);
		}
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
		let visitedTimes = [];
		let visitedMarkings = [];
		let visitedMarkingsTimes = [];
		let missingActivitiesInModel = [];
		let mainidx = 0;
		visitedMarkings.push(marking);
		visitedMarkingsTimes.push(marking.getAssociatedTimest());
		while (mainidx < activities.length) {
			let act = activities[mainidx];
			if (act in transitionsMap) {
				currTimestamp = arrTimestamp[mainidx];
				let trans = transitionsMap[act];
				let transPreMarking = trans.getPreMarking();
				let transPostMarking = trans.getPostMarking();
				let enabled = marking.getEnabledTransitions();
				let newVisitedTransitions = [];
				let newVisitedTimes = [];
				let newVisitedMarkings = [];
				let newVisitedMarkingsTimes = [];
				for (let trans of visitedTransitions) {
					newVisitedTransitions.push(trans);
				}
				for (let time of visitedTimes) {
					newVisitedTimes.push(time);
				}
				for (let mark of visitedMarkings) {
					newVisitedMarkings.push(mark);
				}
				for (let time of visitedMarkingsTimes) {
					newVisitedMarkingsTimes.push(time);
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
									internalMarking = internalMarking.execute(internalTrans, currTimestamp);
									newVisitedTransitions.push(internalTrans);
									newVisitedTimes.push(internalTrans.associatedTime);
									newVisitedMarkings.push(internalMarking);
									newVisitedMarkingsTimes.push(internalMarking.getAssociatedTimest());

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
						visitedTimes = newVisitedTimes;
						consumedPerPlace = internalConsumedPerPlace;
						producedPerPlace = internalProducedPerPlace;
						visitedMarkings = newVisitedMarkings;
						visitedMarkingsTimes = newVisitedMarkingsTimes;
					}
				}
				if (!(enabled.includes(trans))) {
					// inserts missing tokens
					for (let place in transPreMarking) {
						let diff = transPreMarking[place];
						if (place in marking.tokens) {
							diff -= marking.tokens[place];
						}
						let plObj = acceptingPetriNet.net.places[place];
						plObj.associatedTime = currTimestamp;
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
				marking = marking.execute(trans, currTimestamp);
				visitedTransitions.push(trans);
				visitedTimes.push(trans.associatedTime);
				visitedMarkings.push(marking);
				visitedMarkingsTimes.push(marking.getAssociatedTimest());
			}
			else if (!(act in missingActivitiesInModel)) {
				missingActivitiesInModel.push(act);
			}
			mainidx++;
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
				let newVisitedTimes = [];
				let newVisitedMarkings = [];
				let newVisitedMarkingsTimes = [];
				for (let trans of visitedTransitions) {
					newVisitedTransitions.push(trans);
				}
				for (let time of visitedTimes) {
					newVisitedTimes.push(time);
				}
				for (let mark of visitedMarkings) {
					newVisitedMarkings.push(mark);
				}
				for (let time of visitedMarkingsTimes) {
					newVisitedMarkingsTimes.push(time);
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
								internalMarking = internalMarking.execute(internalTrans, currTimestamp);
								newVisitedTransitions.push(internalTrans);
								newVisitedTimes.push(internalTrans.associatedTime);
								newVisitedMarkings.push(internalMarking);
								newVisitedMarkingsTimes.push(internalMarking.getAssociatedTimest());
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
					visitedTimes = newVisitedTimes;
					consumedPerPlace = internalConsumedPerPlace;
					producedPerPlace = internalProducedPerPlace;
					visitedMarkings = newVisitedMarkings;
					visitedMarkingsTimes = newVisitedMarkingsTimes;
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
		return {"consumed": consumed, "produced": produced, "missing": missing, "remaining": remaining, "visitedTransitions": visitedTransitions, "visitedTransitionsTimes": visitedTimes, "visitedMarkings": visitedMarkings, "visitedMarkingsTimes": visitedMarkingsTimes, "missingActivitiesInModel": missingActivitiesInModel, "fitness": fitness, "isFit": isFit, "reachedMarking": marking, "consumedPerPlace": consumedPerPlace, "producedPerPlace": producedPerPlace, "missingPerPlace": missingPerPlace, "remainingPerPlace": remainingPerPlace};
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
	
	static getArrTimestamp(trace, timestampKey) {
		let ret = [];
		for (let eve of trace.events) {
			ret.push(eve.attributes[timestampKey].value.getTime() / 1000.0);
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
	//console.log(err);
}

Pm4JS.registerAlgorithm("TokenBasedReplay", "apply", ["EventLog", "AcceptingPetriNet"], "TokenBasedReplayResult", "Perform Token Based Replay", "Alessandro Berti");


class GeneralizationTbrResults {
	constructor(value) {
		this.value = value;
	}
}

class GeneralizationTbr {
	static apply(log, acceptingPetriNet, activityKey="concept:name") {
		return GeneralizationTbr.evaluate(TokenBasedReplay.apply(log, acceptingPetriNet, activityKey));
	}
	
	static evaluate(tbrResults) {
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
	require("../../../../pm4js.js");
	require("../../../conformance/tokenreplay/algorithm.js");
	module.exports = {GeneralizationTbr: GeneralizationTbr, GeneralizationTbrResults: GeneralizationTbrResults};
	global.GeneralizationTbr = GeneralizationTbr;
	global.GeneralizationTbrResults = GeneralizationTbrResults;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("GeneralizationTbr", "evaluate", ["TokenBasedReplayResult"], "GeneralizationTbrResults", "Calculate Generalization", "Alessandro Berti");


class SimplicityArcDegreeResults {
	constructor(value) {
		this.value = value;
	}
}

class SimplicityArcDegree {
	static apply(acceptingPetriNet, k=0) {
		return SimplicityArcDegree.evaluate(acceptingPetriNet, k);
	}
	
	static evaluate(acceptingPetriNet, k=0) {
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
	require("../../../../pm4js.js");
	require("../../../../objects/petri_net/petri_net.js");
	module.exports = {SimplicityArcDegree: SimplicityArcDegree, SimplicityArcDegreeResults: SimplicityArcDegreeResults};
	global.SimplicityArcDegree = SimplicityArcDegree;
	global.SimplicityArcDegreeResults = SimplicityArcDegreeResults;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("SimplicityArcDegree", "evaluate", ["AcceptingPetriNet"], "SimplicityArcDegreeResults", "Calculate Simplicity (Arc Degree)", "Alessandro Berti");


class FrequencyDfg {
	constructor(activities, startActivities, endActivities, pathsFrequency) {
		this.activities = activities;
		this.startActivities = startActivities;
		this.endActivities = endActivities;
		this.pathsFrequency = pathsFrequency;
	}
	
	getArtificialDfg() {
		let artificialActivities = {};
		let artificialDfg = {};
		Object.assign(artificialDfg, this.pathsFrequency);
		Object.assign(artificialActivities, this.activities);
		let sumSa = 0;
		for (let sa in this.startActivities) {
			artificialDfg[["▶", sa]] = this.startActivities[sa];
			sumSa += this.startActivities[sa];
		}
		for (let ea in this.endActivities) {
			artificialDfg[[ea, "■"]] = this.endActivities[ea];
		}
		artificialActivities["▶"] = sumSa;
		artificialActivities["■"] = sumSa;
		return [artificialActivities, artificialDfg];
	}
	
	unrollArtificialDfg(vect) {
		let artificialActivities = vect[0];
		let artificialDfg = vect[1];
		let newActivities = {};
		let newPathsFrequency = {};
		let newStartActivities = {};
		let newEndActivities = {};
		Object.assign(newActivities, artificialActivities);
		Object.assign(newPathsFrequency, artificialDfg);
		for (let el0 in artificialDfg) {
			let el = el0.split(",");
			if (el[0] == "▶") {
				newStartActivities[el[1]] = artificialDfg[el0];
				delete newPathsFrequency[el];
			}
			else if (el[1] == "■") {
				newEndActivities[el[0]] = artificialDfg[el0];
				delete newPathsFrequency[el];
			}
		}
		delete newActivities["▶"];
		delete newActivities["■"];
		return new FrequencyDfg(newActivities, newStartActivities, newEndActivities, newPathsFrequency);
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
	
	getArtificialDfg() {
		let artificialActivities = {};
		let artificialDfg = {};
		Object.assign(artificialDfg, this.pathsFrequency);
		Object.assign(artificialActivities, this.activities);
		let sumSa = 0;
		for (let sa in this.startActivities) {
			artificialDfg[["▶", sa]] = this.startActivities[sa];
			sumSa += this.startActivities[sa];
		}
		for (let ea in this.endActivities) {
			artificialDfg[[ea, "■"]] = this.endActivities[ea];
		}
		artificialActivities["▶"] = sumSa;
		artificialActivities["■"] = sumSa;
		return [artificialActivities, artificialDfg];
	}
	
	unrollArtificialDfg(vect) {
		let artificialActivities = vect[0];
		let artificialDfg = vect[1];
		let newActivities = {};
		let newPathsFrequency = {};
		let newStartActivities = {};
		let newEndActivities = {};
		let newPathsPerformance = {};
		let newSojournTimes = {};
		Object.assign(newActivities, artificialActivities);
		Object.assign(newPathsFrequency, artificialDfg);
		for (let el0 in artificialDfg) {
			let el = el0.split(",");
			if (el[0] == "▶") {
				newStartActivities[el[1]] = artificialDfg[el0];
				delete newPathsFrequency[el];
			}
			else if (el[1] == "■") {
				newEndActivities[el[0]] = artificialDfg[el0];
				delete newPathsFrequency[el];
			}
		}
		delete newActivities["▶"];
		delete newActivities["■"];
		for (let act in this.sojournTimes) {
			if (act in newActivities) {
				newSojournTimes[act] = this.sojournTimes[act];
			}
		}
		for (let path in this.pathsPerformance) {
			if (path in newPathsFrequency) {
				newPathsPerformance[path] = this.pathsPerformance[path];
			}
		}
		return new PerformanceDfg(newActivities, newStartActivities, newEndActivities, newPathsFrequency, newPathsPerformance, newSojournTimes);
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


class DfgSliders {
	static checkStartReachability(dfg, mustKeepActivities) {
		let outgoing = {};
		for (let path in dfg) {
			let acts = path.split(",");
			if (!(acts[0] in outgoing)) {
				outgoing[acts[0]] = {};
			}
			outgoing[acts[0]][acts[1]] = 0;
		}
		let visited = {};
		let toVisit = ["▶"];
		if (!("▶" in outgoing)) {
			return false;
		}
		while (toVisit.length > 0) {
			let currAct = toVisit.shift();
			if (!(currAct in visited)) {
				for (let otherAct in outgoing[currAct]) {
					if (!(otherAct in visited)) {
						toVisit.push(otherAct);
					}
				}
				visited[currAct] = 0;
			}
		}
		for (let act of mustKeepActivities) {
			if (!(act in visited)) {
				return false;
			}
		}
		return true;
	}
	
	static checkEndReachability(dfg, mustKeepActivities) {
		let ingoing = {};
		for (let path in dfg) {
			let acts = path.split(",");
			if (!(acts[1] in ingoing)) {
				ingoing[acts[1]] = {};
			}
			ingoing[acts[1]][acts[0]] = 0;
		}
		if (!("■" in ingoing)) {
			return false;
		}
		let visited = {};
		let toVisit = ["■"];
		while (toVisit.length > 0) {
			let currAct = toVisit.shift();
			if (!(currAct in visited)) {
				for (let otherAct in ingoing[currAct]) {
					if (!(otherAct in visited)) {
						toVisit.push(otherAct);
					}
				}
				visited[currAct] = 0;
			}
		}
		for (let act of mustKeepActivities) {
			if (!(act in visited)) {
				return false;
			}
		}
		return true;
	}
	
	static filterDfgOnPercActivities(dfg, perc=0.2) {
		let art = dfg.getArtificialDfg();
		let artAct = art[0];
		let artDfg = art[1];
		let artActArray = [];
		for (let act in artAct) {
			if (!(act == "▶" || act == "■")) {
				artActArray.push([act, artAct[act]]);
			}
		}
		artActArray.sort((a, b) => a[1] - b[1]);
		let idx = Math.floor((artActArray.length - 1.0) * (1.0 - perc));
		let activitiesToKeep = [];
		let i = idx;
		while (i < artActArray.length) {
			activitiesToKeep.push(artActArray[i][0]);
			i++;
		}
		i = 0;
		while (i < artActArray.length) {
			let thisAct = artActArray[i][0];
			if (activitiesToKeep.includes(thisAct)) {
				break;
			}
			if (!(thisAct == "▶" || thisAct == "■")) {
				let newDfg = {};
				for (let path in artDfg) {
					let acts = path.split(",");
					if (!(acts[0] == thisAct || acts[1] == thisAct)) {
						newDfg[path] = artDfg[path];
					}
				}
				if (DfgSliders.checkStartReachability(newDfg, activitiesToKeep)) {
					if (DfgSliders.checkEndReachability(newDfg, activitiesToKeep)) {
						artDfg = newDfg;
						delete artAct[thisAct];
					}
				}
			}
			i++;
		}
		let ret = dfg.unrollArtificialDfg([artAct, artDfg]);
		Pm4JS.registerObject(ret, "DFG (activity sliding)");
		return ret;
	}
	
	static filterDfgOnPercPaths(dfg, perc=0.2, keepAllActivities=false) {
		let art = dfg.getArtificialDfg();
		let artAct = art[0];
		let artDfg = art[1];
		let pathsArray = [];
		for (let path in artDfg) {
			pathsArray.push([path, artDfg[path]]);
		}
		pathsArray.sort((a, b) => a[1] - b[1]);
		let idx = Math.floor((pathsArray.length - 1.0) * (1.0 - perc));
		let pathsToKeep = [];
		let i = idx;
		while (i < pathsArray.length) {
			pathsToKeep.push(pathsArray[i][0]);
			i++;
		}
		let activitiesToKeep = [];
		if (keepAllActivities) {
			for (let act in artAct) {
				activitiesToKeep.push(act);
			}
		}
		else {
			for (let path0 of pathsToKeep) {
				let path = path0.split(",");
				if (!(path[0] in activitiesToKeep)) {
					activitiesToKeep.push(path[0]);
				}
				if (!(path[1] in activitiesToKeep)) {
					activitiesToKeep.push(path[1]);
				}
			}
		}
		i = 0;
		while (i < pathsArray.length) {
			let newDfg = {};
			Object.assign(newDfg, artDfg);
			delete newDfg[pathsArray[i][0]];
			if (DfgSliders.checkStartReachability(newDfg, activitiesToKeep)) {
				if (DfgSliders.checkEndReachability(newDfg, activitiesToKeep)) {
					artDfg = newDfg;
					
					let newArtAct = {};
					for (let path in artDfg) {
						let acts = path.split(",");
						newArtAct[acts[0]] = artAct[acts[0]];
						newArtAct[acts[1]] = artAct[acts[1]];
					}
					artAct = newArtAct;
				}
			}
			i++;
		}
		let ret = dfg.unrollArtificialDfg([artAct, artDfg]);
		Pm4JS.registerObject(ret, "DFG (paths sliding)");
		return ret;
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {DfgSliders: DfgSliders};
	global.DfgSliders = DfgSliders;
}
catch (err) {
	// not in Node
}

Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercActivities", ["FrequencyDfg"], "FrequencyDfg", "Slide DFG on activities", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercActivities", ["PerformanceDfg"], "PerformanceDfg", "Slide DFG on activities", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercPaths", ["FrequencyDfg"], "FrequencyDfg", "Slide DFG on paths", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercPaths", ["PerformanceDfg"], "PerformanceDfg", "Slide DFG on paths", "Alessandro Berti");


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
				if (activityKey in trace.events[i].attributes && activityKey in trace.events[i+1].attributes) {
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
				if (activityKey in trace.events[i].attributes && activityKey in trace.events[i+1].attributes) {
					let act1 = trace.events[i].attributes[activityKey].value;
					let act2 = trace.events[i+1].attributes[activityKey].value;
					let path = act1+","+act2;
					let ts1 = trace.events[i].attributes[timestampKey].value;
					let ts2 = trace.events[i+1].attributes[startTimestampKey].value;
					let diff = 0;
					if (BusinessHours.ENABLED) {
						diff = BusinessHours.apply(ts1, ts2);
					}
					else {
						ts1 = ts1.getTime();
						ts2 = ts2.getTime();
						diff = (ts2 - ts1)/1000;
					}
					if (!(path in paths)) {
						paths[path] = [];
					}
					paths[path].push(diff);
				}
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
			else if (aggregationMeasure == "raw_values") {
				// returns the raw values
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
		return InductiveMiner.apply(eventLog, activityKey, threshold, null, removeNoise);
	}
	
	static applyPluginDFG(frequencyDfg, activityKey="concept:name", threshold=0.0, removeNoise=false) {
		return InductiveMiner.apply(null, activityKey, threshold, frequencyDfg, removeNoise);
	}
	
	static applyDfg(frequencyDfg, threshold=0.0, removeNoise=false) {
		return InductiveMiner.apply(null, null, threshold, frequencyDfg, removeNoise);
	}
	
	static apply(eventLog, activityKey="concept:name", threshold=0.0, freqDfg=null, removeNoise=false) {
		let tree = InductiveMiner.inductiveMiner(eventLog, null, activityKey, removeNoise, threshold, freqDfg);
		if (eventLog == null) {
			Pm4JS.registerObject(tree, "Process Tree (Inductive Miner DFG)");
		}
		else {
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
		
	static inductiveMiner(log, treeParent, activityKey, removeNoise, threshold, freqDfg=null, skippable=false) {
		if (log != null) {
			if (threshold == 0) {
				log = InductiveMiner.keepOneTracePerVariant(log, activityKey);
			}
			freqDfg = FrequencyDfgDiscovery.apply(log, activityKey);
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
		}
		else if (threshold > 0 && removeNoise) {
			freqDfg = InductiveMiner.removeNoiseFromDfg(freqDfg, threshold);
		}
		if (skippable) {
			let xor = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			let skip = new ProcessTree(xor, null, null);
			xor.children.push(InductiveMiner.inductiveMiner(null, xor, activityKey, false, threshold, freqDfg));
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
			let detectedFallthrough = null;
			if (log != null) {
				detectedFallthrough = InductiveMiner.detectFallthroughs(log, freqDfg, treeParent, activityKey, threshold);
			}
			else {
				detectedFallthrough = InductiveMiner.detectFallthroughsDfg(freqDfg, treeParent, threshold);
			}
			if (detectedFallthrough != null) {
				return detectedFallthrough;
			}
		}
		if (!(removeNoise) && threshold > 0) {
			return InductiveMiner.inductiveMiner(log, treeParent, activityKey, true, threshold, freqDfg, skippable);
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
		let seqCut = InductiveMinerSequenceCutDetector.detect(freqDfg, activityKey);
		let vect = null;
		let subdfgs = null;
		let skippable = null;
		if (seqCut != null) {
			//console.log("InductiveMinerSequenceCutDetector");
			let seqNode = new ProcessTree(treeParent, ProcessTreeOperator.SEQUENCE, null);
			vect = InductiveMinerSequenceCutDetector.projectDfg(freqDfg, seqCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerSequenceCutDetector.project(log, seqCut, activityKey);
				for (let sublog of logs) {
					let child = InductiveMiner.inductiveMiner(sublog, seqNode, activityKey, false, threshold);
					seqNode.children.push(child);
				}
			}
			else {
				for (let idx in subdfgs) {
					let child = InductiveMiner.inductiveMiner(null, seqNode, activityKey, false, threshold, subdfgs[idx], skippable[idx]);
					seqNode.children.push(child);
				}
			}
			return seqNode;
		}
		let xorCut = InductiveMinerExclusiveCutDetector.detect(freqDfg, activityKey);
		if (xorCut != null) {
			//console.log("InductiveMinerExclusiveCutDetector");
			let xorNode = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			vect = InductiveMinerExclusiveCutDetector.projectDfg(freqDfg, xorCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerExclusiveCutDetector.project(log, xorCut, activityKey);
				for (let sublog of logs) {
					let child = InductiveMiner.inductiveMiner(sublog, xorNode, activityKey, false, threshold);
					xorNode.children.push(child);
				}
			}
			else {
				for (let idx in subdfgs) {
					let child = InductiveMiner.inductiveMiner(null, xorNode, activityKey, false, threshold, subdfgs[idx], skippable[idx]);
					xorNode.children.push(child);
				}
			}
			return xorNode;
		}
		let andCut = InductiveMinerParallelCutDetector.detect(freqDfg, activityKey);
		if (andCut != null) {
			//console.log("InductiveMinerParallelCutDetector");
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			vect = InductiveMinerParallelCutDetector.projectDfg(freqDfg, andCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerParallelCutDetector.project(log, andCut, activityKey);
				for (let sublog of logs) {
					let child = InductiveMiner.inductiveMiner(sublog, parNode, activityKey, false, threshold);
					parNode.children.push(child);
				}
			}
			else {
				for (let idx in subdfgs) {
					let child = InductiveMiner.inductiveMiner(null, parNode, activityKey, false, threshold, subdfgs[idx], skippable[idx]);
					parNode.children.push(child);
				}
			}
			return parNode;
		}
		let loopCut = InductiveMinerLoopCutDetector.detect(freqDfg, activityKey);
		if (loopCut != null) {
			//console.log("InductiveMinerLoopCutDetector");
			let loopNode = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			vect = InductiveMinerLoopCutDetector.projectDfg(freqDfg, loopCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerLoopCutDetector.project(log, loopCut, activityKey);
				loopNode.children.push(InductiveMiner.inductiveMiner(logs[0], loopNode, activityKey, false, threshold));
				loopNode.children.push(InductiveMiner.inductiveMiner(logs[1], loopNode, activityKey, false, threshold));
			}
			else {
				loopNode.children.push(InductiveMiner.inductiveMiner(null, loopNode, activityKey, false, threshold, subdfgs[0], skippable[0]));
				loopNode.children.push(InductiveMiner.inductiveMiner(null, loopNode, activityKey, false, threshold, subdfgs[1], skippable[1]));
			}
			return loopNode;
		}
		return null;
	}
	
	static detectFallthroughsDfg(freqDfg, treeParent, threshold) {
		let activityConcurrentCut = InductiveMinerActivityConcurrentFallthroughDFG.detect(freqDfg, threshold);
		if (activityConcurrentCut != null) {
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			let xorWithSkipsNode = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			parNode.children.push(xorWithSkipsNode);
			let actNode = new ProcessTree(xorWithSkipsNode, null, activityConcurrentCut[0]);
			let skipNode = new ProcessTree(xorWithSkipsNode, null, null);
			xorWithSkipsNode.children.push(actNode);
			xorWithSkipsNode.children.push(skipNode);
			let xorWithSkipsNode2 = new ProcessTree(parNode, ProcessTreeOperator.EXCLUSIVE, null);
			let skipNode2 = new ProcessTree(xorWithSkipsNode2, null, null);
			xorWithSkipsNode2.children.push(activityConcurrentCut[1]);
			xorWithSkipsNode2.children.push(skipNode2);
			activityConcurrentCut[1].parentNode = xorWithSkipsNode2;
			parNode.children.push(xorWithSkipsNode2);
			parNode.properties["concurrentActivity"] = activityConcurrentCut[0];
			return parNode;
		}
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
			parNode.properties["concurrentActivity"] = activityConcurrentCut[0];
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
	static detect(freqDfg, activityKey) {
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
	
	static projectDfg(dfg, groups) {
		let startActivities = [];
		let endActivities = [];
		let activities = [];
		let dfgs = [];
		let skippable = [];
		for (let g of groups) {
			skippable.push(false);
		}
		let activitiesIdx = {};
		for (let gind in groups) {
			let g = groups[gind]
			for (let act of g) {
				activitiesIdx[act] = parseInt(gind);
			}
		}
		let i = 0;
		while (i < groups.length) {
			let toSuccArcs = {};
			let fromPrevArcs = {};
			if (i < groups.length - 1) {
				for (let arc0 in dfg.pathsFrequency) {
					let arc = arc0.split(",");
					if (groups[i].includes(arc[0]) && groups[i+1].includes(arc[1])) {
						if (!(arc[0] in toSuccArcs)) {
							toSuccArcs[arc[0]] = 0;
						}
						toSuccArcs[arc[0]] += dfg.pathsFrequency[arc0];
					}
				}
			}
			if (i > 0) {
				for (let arc0 in dfg.pathsFrequency) {
					let arc = arc0.split(",");
					if (groups[i-1].includes(arc[0]) && groups[i].includes(arc[1])) {
						if (!(arc[1] in fromPrevArcs)) {
							fromPrevArcs[arc[1]] = 0;
						}
						fromPrevArcs[arc[1]] += dfg.pathsFrequency[arc0];
					}
				}
			}
			
			if (i == 0) {
				startActivities.push({});
				for (let act in dfg.startActivities) {
					if (groups[i].includes(act)) {
						startActivities[i][act] = dfg.startActivities[act];
					}
					else {
						let j = i;
						while (j < activitiesIdx[act]) {
							skippable[j] = true;
							j++;
						}
					}
				}
			}
			else {
				startActivities.push(fromPrevArcs);
			}
			
			if (i == groups.length - 1) {
				endActivities.push({});
				for (let act in dfg.endActivities) {
					if (groups[i].includes(act)) {
						endActivities[i][act] = dfg.endActivities[act];
					}
					else {
						let j = activitiesIdx[act] + 1;
						while (j <= i) {
							skippable[j] = true;
							j++;
						}
					}
				}
			}
			else {
				endActivities.push(toSuccArcs);
			}
			activities.push({});
			for (let act of groups[i]) {
				activities[i][act] = dfg.activities[act];
			}
			dfgs.push({});
			for (let arc0 in dfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (groups[i].includes(arc[0]) && groups[i].includes(arc[1])) {
					dfgs[i][arc0] = dfg.pathsFrequency[arc0];
				}
			}
			i++;
		}
		i = 0;
		while (i < dfgs.length) {
			dfgs[i] = new FrequencyDfg(activities[i], startActivities[i], endActivities[i], dfgs[i]);
			i++;
		}
		for (let arc0 in dfg.pathsFrequency) {
			let arc = arc0.split(",");
			let z = activitiesIdx[arc[1]];
			let j = activitiesIdx[arc[0]] + 1;
			while (j < z) {
				skippable[j] = false;
				j++;
			}
		}
		return [dfgs, skippable];
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
	static detect(freqDfg0, activityKey) {
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
		let actReach = InductiveMinerGeneralUtilities.activityReachability(freqDfg0);
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		for (let conn of connComp) {
			let isRedo = true;
			for (let act in freqDfg0.startActivities) {
				for (let act2 of conn) {
					if (!(act2 in actReach[act])) {
						isRedo = false;
						break;
					}
				}
			}
			if (isRedo) {
				for (let act in freqDfg0.endActivities) {
					for (let act2 of conn) {
						if (!(act2 in actReach[act])) {
							isRedo = false;
							break;
						}
					}
				}
			}
			if (isRedo) {
				for (let act of conn) {
					for (let sa in freqDfg0.startActivities) {
						if (!(sa in freqDfg0.endActivities)) {
							if (!([act, sa] in freqDfg0.pathsFrequency)) {
								isRedo = false;
								break;
							}
						}
					}
				}
			}
			if (isRedo) {
				for (let act of conn) {
					for (let ea in freqDfg0.endActivities) {
						if (!(ea in freqDfg0.startActivities)) {
							if (!([ea, act] in freqDfg0.pathsFrequency)) {
								isRedo = false;
								break;
							}
						}
					}
				}
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
	
	static projectDfg(frequencyDfg, groups) {
		let dfgs = [];
		let skippable = [false, false];
		for (let gind in groups) {
			let g = groups[gind];
			let activities = {};
			let startActivities = {};
			let endActivities = {};
			let pathsFrequency = {};
			for (let act in frequencyDfg.activities) {
				if (g.includes(act)) {
					activities[act] = frequencyDfg.activities[act];
				}
			}
			for (let arc0 in frequencyDfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (g.includes(arc[0]) && g.includes(arc[1])) {
					pathsFrequency[arc0] = frequencyDfg.pathsFrequency[arc0];
				}
				if (arc[1] in frequencyDfg.startActivities && arc[0] in frequencyDfg.endActivities) {
					skippable[1] = true;
				}
			}
			if (gind == 0) {
				for (let act in frequencyDfg.startActivities) {
					if (g.includes(act)) {
						startActivities[act] = frequencyDfg.startActivities[act];
					}
					else {
						skippable[0] = true;
					}
				}
				for (let act in frequencyDfg.endActivities) {
					if (g.includes(act)) {
						endActivities[act] = frequencyDfg.endActivities[act];
					}
					else {
						skippable[0] = true;
					}
				}
			}
			else if (gind == 1) {
				for (let act of g) {
					startActivities[act] = 1;
					endActivities[act] = 1;
				}
			}
			dfgs.push(new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency));
		}
		return [dfgs, skippable];
	}
}

class InductiveMinerParallelCutDetector {
	static detect(freqDfg, activityKey) {
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
	
	static projectDfg(frequencyDfg, groups) {
		let dfgs = [];
		let skippable = [];
		for (let gind in groups) {
			let g = groups[gind];
			let startActivities = {};
			let endActivities = {};
			let activities = {};
			let pathsFrequency = {};
			for (let act in frequencyDfg.startActivities) {
				if (g.includes(act)) {
					startActivities[act] = frequencyDfg.startActivities[act];
				}
			}
			for (let act in frequencyDfg.endActivities) {
				if (g.includes(act)) {
					endActivities[act] = frequencyDfg.endActivities[act];
				}
			}
			for (let act in frequencyDfg.activities) {
				if (g.includes(act)) {
					activities[act] = frequencyDfg.activities[act];
				}
			}
			for (let arc0 in frequencyDfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (g.includes(arc[0]) && g.includes(arc[1])) {
					pathsFrequency[arc0] = frequencyDfg.pathsFrequency[arc0];
				}
			}
			dfgs.push(new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency));
			skippable.push(false);
		}
		return [dfgs, skippable];
	}
}

class InductiveMinerExclusiveCutDetector {
	static detect(freqDfg, activityKey) {
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		if (connComp.length > 1) {
			return connComp;
		}
		return null;
	}
	
	static projectDfg(frequencyDfg, groups) {
		let dfgs = [];
		let skippable = [];
		for (let gind in groups) {
			let g = groups[gind];
			let startActivities = {};
			let endActivities = {};
			let activities = {};
			let pathsFrequency = {};
			for (let act in frequencyDfg.startActivities) {
				if (g.includes(act)) {
					startActivities[act] = frequencyDfg.startActivities[act];
				}
			}
			for (let act in frequencyDfg.endActivities) {
				if (g.includes(act)) {
					endActivities[act] = frequencyDfg.endActivities[act];
				}
			}
			for (let act in frequencyDfg.activities) {
				if (g.includes(act)) {
					activities[act] = frequencyDfg.activities[act];
				}
			}
			for (let arc0 in frequencyDfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (g.includes(arc[0]) && g.includes(arc[1])) {
					pathsFrequency[arc0] = frequencyDfg.pathsFrequency[arc0];
				}
			}
			dfgs.push(new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency));
			skippable.push(false);
		}
		return [dfgs, skippable];
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

class InductiveMinerActivityConcurrentFallthroughDFG {
	static removeActFromDFG(freqDfg, activity) {
		let activities = {};
		let startActivities = {};
		let endActivities = {};
		let pathsFrequency = {};
		for (let act in freqDfg.activities) {
			if (act != activity) {
				activities[act] = freqDfg.activities[act];
			}
		}
		for (let act in freqDfg.startActivities) {
			if (act != activity) {
				startActivities[act] = freqDfg.startActivities[act];
			}
		}
		for (let act in freqDfg.endActivities) {
			if (act != activity) {
				endActivities[act] = freqDfg.endActivities[act];
			}
		}
		for (let path0 in freqDfg.pathsFrequency) {
			let path = path0.split(",");
			if (path[0] != activity && path[1] != activity) {
				pathsFrequency[path0] = freqDfg.pathsFrequency[path0];
			}
		}
		return new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency);
	}
	
	static detect(freqDfg, threshold) {
		for (let act in freqDfg.activities) {
			let subdfg = InductiveMinerActivityConcurrentFallthroughDFG.removeActFromDFG(freqDfg, act);
			let detectedCut = InductiveMiner.detectCut(null, subdfg, null, null, threshold);
			if (detectedCut != null) {
				return [act, detectedCut];
			}
		}
		return null;
	}
	
	static projectDfg(frequencyDfg, act) {
		return InductiveMinerActivityConcurrentFallthroughDFG.removeActFromDFG(freqDfg, act);
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
	//console.log(err);
}

Pm4JS.registerAlgorithm("InductiveMiner", "applyPlugin", ["EventLog"], "ProcessTree", "Mine a Process Tree using the Inductive Miner", "Alessandro Berti");
Pm4JS.registerAlgorithm("InductiveMiner", "applyPluginDFG", ["FrequencyDfg"], "ProcessTree", "Mine a Process Tree using the Inductive Miner Directly-Follows", "Alessandro Berti");
Pm4JS.registerAlgorithm("InductiveMiner", "applyPluginDFG", ["PerformanceDfg"], "ProcessTree", "Mine a Process Tree using the Inductive Miner Directly-Follows", "Alessandro Berti");


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
	//console.log(err);
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

class LogSkeleton {
	constructor(equivalence, neverTogether, alwaysAfter, alwaysBefore, directlyFollows, actCounter) {
		this.equivalence = equivalence;
		this.neverTogether = neverTogether;
		this.alwaysAfter = alwaysAfter;
		this.alwaysBefore = alwaysBefore;
		this.directlyFollows = directlyFollows;
		this.actCounter = actCounter;
	}
	
	filterOnNoiseThreshold(thresh) {
		thresh = 1.0 - thresh;
		let newEquivalence = {};
		let newNeverTogether = {};
		let newAlwaysAfter = {};
		let newAlwaysBefore = {};
		let newDirectlyFollows = {};
		let newActCounter = {};
		for (let cou in this.equivalence) {
			if (this.equivalence[cou] >= thresh) {
				newEquivalence[cou] = this.equivalence[cou];
			}
		}
		for (let cou in this.neverTogether) {
			if (this.neverTogether[cou] >= thresh) {
				newNeverTogether[cou] = this.neverTogether[cou];
			}
		}
		for (let cou in this.alwaysAfter) {
			if (this.alwaysAfter[cou] >= thresh) {
				newAlwaysAfter[cou] = this.alwaysAfter[cou];
			}
		}
		for (let cou in this.alwaysBefore) {
			if (this.alwaysBefore[cou] >= thresh) {
				newAlwaysBefore[cou] = this.alwaysBefore[cou];
			}
		}
		for (let cou in this.directlyFollows) {
			if (this.directlyFollows[cou] >= thresh) {
				newDirectlyFollows[cou] = this.directlyFollows[cou];
			}
		}
		for (let act in this.actCounter) {
			for (let actocc in this.actCounter[act]) {
				if (this.actCounter[act][actocc] >= thresh) {
					if (!(act in newActCounter)) {
						newActCounter[act] = {};
					}
					newActCounter[act][actocc] = this.actCounter[act][actocc];
				}
			}
		}
		return new LogSkeleton(newEquivalence, newNeverTogether, newAlwaysAfter, newAlwaysBefore, newDirectlyFollows, newActCounter);
	}
}

try {
	require('../../pm4js.js');
	module.exports = { LogSkeleton: LogSkeleton };
	global.LogSkeleton = LogSkeleton;
}
catch (err) {
	// not in Node
	//console.log(err);
}

class LogSkeletonDiscovery {
	static apply(eventLog, activityKey="concept:name") {
		let activities = GeneralLogStatistics.getAttributeValues(eventLog, activityKey);
		let neverTogether = {};
		let equivalence = {};
		let equivalenceTotCases = {};
		let alwaysAfter = {};
		let alwaysBefore = {};
		let directlyFollows = {};
		let actCounter = {};
		for (let trace of eventLog.traces) {
			let activitiesCounter = {};
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey].value;
				if (!(act in activitiesCounter)) {
					activitiesCounter[act] = 1;
				}
				else {
					activitiesCounter[act] += 1;
				}
			}
			for (let act in activitiesCounter) {
				if (!(act in actCounter)) {
					actCounter[act] = {};
				}
				if (!(activitiesCounter[act] in actCounter[act])) {
					actCounter[act][activitiesCounter[act]] = 0;
				}
				actCounter[act][activitiesCounter[act]] += 1;
				for (let act2 in activities) {
					let cou = [act, act2].sort();
					if (!(act2 in activitiesCounter)) {
						if (!(cou in neverTogether)) {
							neverTogether[cou] = 1;
						}
						else {
							neverTogether[cou] += 1;
						}
					}
					else if (act2 != act) {
						if (!(cou in equivalenceTotCases)) {
							equivalenceTotCases[cou] = 0;
						}
						equivalenceTotCases[cou] += 1;
						if (activitiesCounter[act] == activitiesCounter[act2]) {
							if (!(cou in equivalence)) {
								equivalence[cou] = 0;
							}
							equivalence[cou] += 1;
						}
					}
				}
			}
			let met = {};
			let i = 0;
			while (i < trace.events.length) {
				met[i] = [];
				i++;
			}
			i = 0;
			while (i < trace.events.length - 1) {
				let acti = trace.events[i].attributes[activityKey].value;
				let j = i + 1;
				while (j < trace.events.length) {
					let actj = trace.events[j].attributes[activityKey].value;
					let cou1 = [acti, actj];
					let cou2 = [actj, acti];
					if (!(met[i].includes(actj))) {
						if (!(cou1 in alwaysAfter)) {
							alwaysAfter[cou1] = 0;
						}
						alwaysAfter[cou1] += 1;
						if (j == i+1) {
							if (!(cou1 in directlyFollows)) {
								directlyFollows[cou1] = 0;
							}
							directlyFollows[cou1] += 1;
						}
						met[i].push(actj);
					}
					if (!(met[j].includes(acti))) {
						if (!(cou2 in alwaysBefore)) {
							alwaysBefore[cou2] = 0;
						}
						alwaysBefore[cou2] += 1;
						met[j].push(acti);
					}
					j++;
				}
				i++;
			}
		}
		// normalize the output before returning
		for (let cou in neverTogether) {
			neverTogether[cou] = (0.0 + neverTogether[cou]) / eventLog.traces.length;
		}
		for (let act in actCounter) {
			let intSum = 0;
			for (let actc in actCounter[act]) {
				intSum += actCounter[act][actc];
				actCounter[act][actc] = (0.0 + actCounter[act][actc]) / eventLog.traces.length;
			}
			if (eventLog.traces.length > intSum) {
				actCounter[act]["0"] = (0.0 + eventLog.traces.length - intSum) / eventLog.traces.length;
			}
		}
		for (let cou in equivalence) {
			equivalence[cou] = (0.0 + equivalence[cou]) / equivalenceTotCases[cou];
		}
		for (let path0 in alwaysAfter) {
			let path = path0.split(",");
			alwaysAfter[path0] = alwaysAfter[path0] / activities[path[0]];
		}
		for (let path0 in directlyFollows) {
			let path = path0.split(",");
			directlyFollows[path0] = directlyFollows[path0] / activities[path[0]];
		}
		for (let path0 in alwaysBefore) {
			let path = path0.split(",");
			alwaysBefore[path0] = alwaysBefore[path0] / activities[path[0]];
		}
		let ret = new LogSkeleton(equivalence, neverTogether, alwaysAfter, alwaysBefore, directlyFollows, actCounter);
		Pm4JS.registerObject(ret, "Log Skeleton");
		return ret;
	}
}

try {
	require('../../../pm4js.js');
	require('../../../objects/log/log.js');
	require('../../../objects/skeleton/log_skeleton.js');
	require('../../../statistics/log/general.js');
	module.exports = {LogSkeletonDiscovery: LogSkeletonDiscovery};
	global.LogSkeletonDiscovery = LogSkeletonDiscovery;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("LogSkeletonDiscovery", "apply", ["EventLog"], "LogSkeleton", "Discover Log Skeleton from Log", "Alessandro Berti");


class LogSkeletonConformanceCheckingResult {
	constructor(log, results) {
		this.results = results;
		this.totalTraces = log.traces.length;
		this.fitTraces = 0;
		this.deviationsRecord = {};
		let i = 0;
		while (i < this.results.length) {
			if (this.results[i].length == 0) {
				this.fitTraces++;
			}
			else {
				for (let dev of this.results[i]) {
					if (!(dev in this.deviationsRecord)) {
						this.deviationsRecord[dev] = [];
					}
					this.deviationsRecord[dev].push(i);
				}
			}
			i++;
		}
		this.percentageFitTraces = this.fitTraces / this.totalTraces;
	}
}

class LogSkeletonConformanceChecking {
	static apply(log, skeleton0, noiseThreshold=0.0, activityKey="concept:name") {
		let skeleton = skeleton0.filterOnNoiseThreshold(noiseThreshold);
		let results = [];
		for (let trace of log.traces) {
			results.push(LogSkeletonConformanceChecking.applyTrace(trace, skeleton, activityKey));
		}
		let ret = new LogSkeletonConformanceCheckingResult(log, results);
		Pm4JS.registerObject(ret, "Log-Log Skeleton Conformance Checking Result");
		return ret;
	}
	
	static applyTrace(trace, skeleton, activityKey) {
		let res = {};
		LogSkeletonConformanceChecking.applyEquivalence(trace, skeleton.equivalence, activityKey, res);
		LogSkeletonConformanceChecking.applyAlwaysAfter(trace, skeleton.alwaysAfter, activityKey, res);
		LogSkeletonConformanceChecking.applyAlwaysBefore(trace, skeleton.alwaysBefore, activityKey, res);
		LogSkeletonConformanceChecking.applyNeverTogether(trace, skeleton.neverTogether, activityKey, res);
		LogSkeletonConformanceChecking.applyActCounter(trace, skeleton.actCounter, activityKey, res);
		LogSkeletonConformanceChecking.applyDirectlyFollows(trace, skeleton.directlyFollows, activityKey, res);
		return Object.keys(res);
	}
	
	static applyEquivalence(trace, skeletonEquivalence, activityKey, res) {
		let actCounter = {};
		for (let eve of trace.events) {
			let act = eve.attributes[activityKey].value;
			if (!(act in actCounter)) {
				actCounter[act] = 1;
			}
			else {
				actCounter[act] += 1;
			}
		}
		for (let cou0 in skeletonEquivalence) {
			let cou = cou0.split(",");
			if (cou[0] in actCounter && cou[1] in actCounter && actCounter[cou[0]] != actCounter[cou[1]]) {
				res[["equivalence", cou]] = 0;
			}
		}
	}
	
	static applyAlwaysAfter(trace, skeletonAlwaysAfter, activityKey, res) {
		let i = 0;
		while (i < trace.events.length - 1) {
			let acti = trace.events[i].attributes[activityKey].value;
			let afterActivities = [];
			for (let cou0 in skeletonAlwaysAfter) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					afterActivities.push(cou[1]);
				}
			}
			let followingActivities = {};
			let j = i + 1;
			while (j < trace.events.length) {
				let actj = trace.events[j].attributes[activityKey].value;
				followingActivities[actj] = 0;
				j++;
			}
			for (let act of afterActivities) {
				if (!(act in followingActivities)) {
					res[["alwaysAfter", acti, act]] = 0;
				}
			}
			i++;
		}
	}
	
	static applyDirectlyFollows(trace, skeletonDirectlyFollows, activityKey, res) {
		let i = 0;
		while (i < trace.events.length - 1) {
			let acti = trace.events[i].attributes[activityKey].value;
			let afterActivities = [];
			for (let cou0 in skeletonDirectlyFollows) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					afterActivities.push(cou[1]);
				}
			}
			let actj = trace.events[i+1].attributes[activityKey].value;
			let followingActivities = [actj];
			let isOk = afterActivities.length == 0;
			for (let act of afterActivities) {
				if (followingActivities.includes(act)) {
					isOk = true;
				}
			}
			if (!(isOk)) {
				res[["directlyFollows", acti]] = 0;
			}
			i++;
		}
	}
	
	static applyAlwaysBefore(trace, skeletonAlwaysBefore, activityKey, res) {
		let i = 1;
		while (i < trace.events.length) {
			let acti = trace.events[i].attributes[activityKey].value;
			let beforeActivities = [];
			for (let cou0 in skeletonAlwaysBefore) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					beforeActivities.push(cou[1]);
				}
			}
			let precedingActivities = {};
			let j = i - 1;
			while (j >= 0) {
				let actj = trace.events[j].attributes[activityKey].value;
				precedingActivities[actj] = 0;
				j--;
			}
			for (let act of beforeActivities) {
				if (!(act in precedingActivities)) {
					res[["alwaysBefore", acti, act]] = 0;
				}
			}
			i++;
		}
	}
	
	static applyNeverTogether(trace, skeletonNeverTogether, activityKey, res) {
		let traceActivities = {};
		for (let eve of trace.events) {
			let acti = eve.attributes[activityKey].value;
			traceActivities[acti] = 0;
		}
		traceActivities = Object.keys(traceActivities);
		let i = 0;
		while (i < traceActivities.length-1) {
			let j = i + 1;
			while (j < traceActivities.length) {
				let cou = [traceActivities[i], traceActivities[j]].sort();
				if (cou in skeletonNeverTogether) {
					res[["neverTogether", cou]] = 0;
				}
				j++;
			}
			i = i + 1;
		}
	}
	
	static applyActCounter(trace, skeletonActCounter, activityKey, res) {
		let traceActivities = {};
		for (let eve of trace.events) {
			let acti = eve.attributes[activityKey].value;
			if (!(acti in traceActivities)) {
				traceActivities[acti] = 1;
			}
			else {
				traceActivities[acti] += 1;
			}
		}
		for (let act in traceActivities) {
			if (act in skeletonActCounter) {
				if (!(traceActivities[act] in skeletonActCounter[act])) {
					res[["actCounter", act, traceActivities[act]]] = 0;
				}
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {LogSkeletonConformanceChecking: LogSkeletonConformanceChecking, LogSkeletonConformanceCheckingResult: LogSkeletonConformanceCheckingResult};
	global.LogSkeletonConformanceChecking = LogSkeletonConformanceChecking;
	global.LogSkeletonConformanceCheckingResult = LogSkeletonConformanceCheckingResult;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("LogSkeletonConformanceChecking", "apply", ["EventLog", "LogSkeleton"], "LogSkeletonConformanceCheckingResult", "Perform Conformance Checking using the Log Skeleton", "Alessandro Berti");


class CaseFeaturesOutput {
	constructor(data, features) {
		this.data = data;
		this.features = features;
	}
	
	transformToDct() {
		let lst = [];
		let i = 0;
		while (i < this.data.length) {
			let dct = {};
			let j = 0;
			while (j < this.data[i].length) {
				dct[this.features[j]] = this.data[i][j];
				j++;
			}
			lst.push(dct);
			i++;
		}
		return lst;
	}
	
	scaling() {
		let j = 0;
		while (j < this.features.length) {
			let minValue = 99999999999;
			let maxValue = -99999999999;
			let i = 0;
			while (i < this.data.length) {
				minValue = Math.min(minValue, this.data[i][j]);
				maxValue = Math.max(maxValue, this.data[i][j]);
				i++;
			}
			i = 0;
			while (i < this.data.length) {
				if (minValue != maxValue) {
					this.data[i][j] = (this.data[i][j] - minValue)/(maxValue - minValue);
				}
				else {
					this.data[i][j] = 1;
				}
				i++;
			}
			j++;
		}
	}
	
	variancePerFea() {
		let ret = [];
		let j = 0;
		while (j < this.data[0].length) {
			let avg = 0.0;
			let i = 0;
			while (i < this.data.length) {
				avg += this.data[i][j];
				i++;
			}
			avg = avg / this.data.length;
			let vr = 0.0;
			i = 0;
			while (i < this.data.length) {
				vr += (this.data[i][j] - avg)*(this.data[i][j] - avg)
				i++;
			}
			vr = vr / this.data.length;
			ret.push(vr);
			j++;
		}
		return ret;
	}
	
	filterOnVariance(threshold) {
		let varPerFea = OcelObjectFeatures.variancePerFea(this.data);
		let data = [];
		let featureNames = [];
		let i = 0;
		while (i < this.features.length) {
			if (varPerFea[i] > threshold) {
				featureNames.push(this.features[i]);
			}
			i++;
		}
		i = 0;
		while (i < this.data.length) {
			let j = 0;
			let arr = [];
			while (j < this.data[i].length) {
				if (varPerFea[j] > threshold) {
					arr.push(this.data[i][j]);
				}
				j++;
			}
			data.push(arr);
			i++;
		}
		return new CaseFeaturesOutput(data, featureNames);
	}
}

class CaseFeatures {
	static apply(eventLog, activityKey="concept:name", caseIdKey="concept:name", evStrAttr=null, evNumAttr=null, trStrAttr=null, trNumAttr=null, evSuccStrAttr=null, timestampKey="time:timestamp", resourceKey="org:resource", includeWorkInProgress=CaseFeatures.INCLUDE_WIP, includeResourceWorkload=CaseFeatures.INCLUDE_RESOURCE_WORKLOAD) {
		let vect = null;
		if (evStrAttr == null || evNumAttr == null || trStrAttr == null || trNumAttr == null || evSuccStrAttr == null) {
			vect = CaseFeatures.automaticFeatureSelection(eventLog, activityKey);
		}
		if (evStrAttr == null) {
			evStrAttr = vect[0];
		}
		if (evNumAttr == null) {
			evNumAttr = vect[1];
		}
		if (trStrAttr == null) {
			trStrAttr = vect[2];
		}
		if (trNumAttr == null) {
			trNumAttr = vect[3];
		}
		if (evSuccStrAttr == null) {
			evSuccStrAttr = vect[4];
		}
		vect = CaseFeatures.formFeaturesFromSpecification(eventLog, evStrAttr, evNumAttr, trStrAttr, trNumAttr, evSuccStrAttr);
		let features = vect[0];
		let valuesCorr = vect[1];
		let data = [];
		for (let trace of eventLog.traces) {
			let vect = [];
			for (let attr of trNumAttr) {
				vect.push(trace.attributes[attr].value);
			}
			for (let attr of evNumAttr) {
				let i = trace.events.length - 1;
				while (i >= 0) {
					if (attr in trace.events[i].attributes) {
						vect.push(trace.events[i].attributes[attr].value);
						break;
					}
					i--;
				}
			}
			for (let attr of trStrAttr) {
				let value = null;
				if (attr in trace.attributes) {
					value = trace.attributes[attr].value;
				}
				for (let val of valuesCorr["trace@@"+attr]) {
					if (val == value) {
						vect.push(1);
					}
					else {
						vect.push(0);
					}
				}
			}
			for (let attr of evStrAttr) {
				let values = {};
				for (let eve of trace.events) {
					if (attr in eve.attributes) {
						let val = eve.attributes[attr].value;
						if (!(val in values)) {
							values[val] = 1;
						}
						else {
							values[val] += 1;
						}
					}
				}
				for (let val of valuesCorr["event@@"+attr]) {
					if (val in values) {
						vect.push(values[val]);
					}
					else {
						vect.push(0);
					}
				}
			}
			for (let attr of evSuccStrAttr) {
				let paths = {};
				let i = 0;
				while (i < trace.events.length - 1) {
					if (attr in trace.events[i].attributes && attr in trace.events[i+1].attributes) {
						let val1 = trace.events[i].attributes[attr].value;
						let val2 = trace.events[i+1].attributes[attr].value;
						let path = val1+","+val2;
						if (!(path in paths)) {
							paths[path] = 1;
						}
						else {
							paths[path] += 1;
						}
					}
					i++;
				}
				for (let path of valuesCorr["succession@@"+attr]) {
					if (path in paths) {
						vect.push(paths[path]);
					}
					else {
						vect.push(0);
					}
				}
			}
			data.push(vect);
		}
		let activityMinMaxIdx = CaseFeatures.activityMinMaxIndex(eventLog, activityKey);
		let activityMinMaxTimeFromStart = CaseFeatures.activityMinMaxTimeFromStart(eventLog, activityKey, timestampKey);
		let activityMinMaxTimeToEnd = CaseFeatures.activityMinMaxTimeToEnd(eventLog, activityKey, timestampKey);
		let pathDuration = CaseFeatures.pathDuration(eventLog, activityKey, timestampKey);
		
		let i = 0;
		while (i < data.length) {
			data[i] = [...data[i], ...activityMinMaxIdx[0][i], ...activityMinMaxTimeFromStart[0][i], ...activityMinMaxTimeToEnd[0][i], ...pathDuration[0][i]];
			i++;
		}
		features = [...features, ...activityMinMaxIdx[1], ...activityMinMaxTimeFromStart[1], ...activityMinMaxTimeToEnd[1], ...pathDuration[1]];
		
		if (includeWorkInProgress) {
			let wip = CaseFeatures.workInProgress(eventLog, timestampKey, caseIdKey);
			i = 0;
			while (i < data.length) {
				data[i] = [...data[i], ...wip[0][i]];
				i++;
			}
			features = [...features, ...wip[1]];
		}
		if (includeResourceWorkload) {
			let resWorkload = CaseFeatures.resourceWorkload(eventLog, timestampKey, resourceKey);
			i = 0;
			while (i < data.length) {
				data[i] = [...data[i], ...resWorkload[0][i]];
				i++;
			}
			features = [...features, ...resWorkload[1]];
		}
		return new CaseFeaturesOutput(data, features);
	}
	
	static formFeaturesFromSpecification(eventLog, evStrAttr, evNumAttr, trStrAttr, trNumAttr, evSuccStrAttr) {
		let features = [];
		let valuesCorr = {};
		for (let attr of evNumAttr) {
			features.push("event@@"+attr);
		}
		for (let attr of trNumAttr) {
			features.push("trace@@"+attr);
		}
		for (let attr of evStrAttr) {
			let values = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, attr));
			valuesCorr["event@@"+attr] = values;
			for (let val of values) {
				features.push("event@@"+attr+"##"+val);
			}
		}
		for (let attr of trStrAttr) {
			let values = Object.keys(GeneralLogStatistics.getTraceAttributeValues(eventLog, attr));
			valuesCorr["trace@@"+attr] = values;
			for (let val of values) {
				features.push("trace@@"+attr+"##"+val);
			}
		}
		for (let attr of evSuccStrAttr) {
			let frequencyDfg = Object.keys(FrequencyDfgDiscovery.apply(eventLog, attr).pathsFrequency);
			valuesCorr["succession@@"+attr] = frequencyDfg;
			for (let path of frequencyDfg) {
				features.push("succession@@"+attr+"##"+path);
			}
		}
		return [features, valuesCorr];
	}
	
	static automaticFeatureSelection(eventLog, activityKey="concept:name", caseIdKey="concept:name") {
		let evAttrWithType = GeneralLogStatistics.getEventAttributesWithType(eventLog);
		let trAttrWithType = GeneralLogStatistics.getTraceAttributesWithType(eventLog);
		let evStrAttrCandidatesWithValues = {};
		let evNumAttr = [];
		let trStrAttrCandidatesWithValues = {};
		let trNumAttr = [];
		for (let attr in evAttrWithType) {
			if (evAttrWithType[attr] == "string") {
				let values = GeneralLogStatistics.getAttributeValues(eventLog, attr);
				if (Object.keys(values).length >= 2 && (Object.keys(values).length <= 50 || attr == activityKey)) {
					evStrAttrCandidatesWithValues[attr] = values;
				}
			}
			else if (evAttrWithType[attr] == "number") {
				let res = CaseFeatures.checkNumericEventAttribute(eventLog, attr);
				if (res) {
					evNumAttr.push(attr);
				}
			}
		}
		for (let attr in trAttrWithType) {
			if (trAttrWithType[attr] == "string") {
				if (attr != caseIdKey) {
					let values = GeneralLogStatistics.getTraceAttributeValues(eventLog, attr);
					if (Object.keys(values).length >= 2 && Object.keys(values).length <= 50) {
						trStrAttrCandidatesWithValues[attr] =  values;
					}
				}
			}
			else if (trAttrWithType[attr] == "number") {
				let res = CaseFeatures.checkNumericTraceAttribute(eventLog, attr);
				if (res) {
					trNumAttr.push(attr);
				}
			}
		}
		return [Object.keys(evStrAttrCandidatesWithValues), evNumAttr, Object.keys(trStrAttrCandidatesWithValues), trNumAttr, [activityKey]];
	}
	
	static checkNumericEventAttribute(log, attr) {
		for (let trace of log.traces) {
			let found = false;
			for (let eve of trace.events) {
				if (attr in eve.attributes) {
					found = true;
					break;
				}
			}
			if (!(found)) {
				return false;
			}
		}
		return true;
	}
	
	static checkNumericTraceAttribute(log, attr) {
		for (let trace of log.traces) {
			if (!(attr in trace.attributes)) {
				return false;
			}
		}
		return true;
	}
	
	static activityMinMaxIndex(log, activityKey="concept:name", naRep=-1) {
		let features = ["@@act_min_idx", "@@act_max_idx"];
		let data = [];
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(log, activityKey));
		for (let trace of log.traces) {
			let minIdx = {};
			let maxIdx = {};
			let i = 0;
			while (i < trace.events.length) {
				let act = trace.events[i].attributes[activityKey];
				if (act != null) {
					act = act.value;
					if (!(act in minIdx)) {
						minIdx[act] = i;
					}
					maxIdx[act] = i;
				}
				i++;
			}
			let arr = [];			
			for (let act of activities) {
				if (act in minIdx) {
					arr.push(minIdx[act]);
					arr.push(maxIdx[act]);
				}
				else {
					arr.push(naRep);
					arr.push(naRep);
				}
			}
			data.push(arr);
		}
		return [data, features];
	}
	
	static activityMinMaxTimeFromStart(log, activityKey="concept:name", timestampKey="time:timestamp", naRep=-1) {
		let features = ["@@act_min_time_from_start", "@@act_max_time_from_start"];
		let data = [];
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(log, activityKey));
		for (let trace of log.traces) {
			let minTime = {};
			let maxTime = {};
			let i = 0;
			let consideredTime = 0;
			if (trace.events.length > 0) {
				consideredTime = trace.events[0].attributes[timestampKey].value / 1000.0;
			}
			while (i < trace.events.length) {
				let act = trace.events[i].attributes[activityKey];
				let thisTime = trace.events[i].attributes[timestampKey];
				if (act != null && thisTime != null) {
					act = act.value;
					thisTime = thisTime.value / 1000.0;
					if (!(act in minTime)) {
						minTime[act] = thisTime - consideredTime;
					}
					maxTime[act] = thisTime - consideredTime;
				}
				i++;
			}
			let arr = [];			
			for (let act of activities) {
				if (act in minTime) {
					arr.push(minTime[act]);
					arr.push(maxTime[act]);
				}
				else {
					arr.push(naRep);
					arr.push(naRep);
				}
			}
			data.push(arr);
		}
		
		return [data, features];
	}
	
	static activityMinMaxTimeToEnd(log, activityKey="concept:name", timestampKey="time:timestamp", naRep=-1) {
		let features = ["@@act_min_time_to_end", "@@act_max_time_to_end"];
		let data = [];
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(log, activityKey));
		for (let trace of log.traces) {
			let minTime = {};
			let maxTime = {};
			let i = 0;
			let consideredTime = 0;
			if (trace.events.length > 0) {
				consideredTime = trace.events[trace.events.length - 1].attributes[timestampKey].value / 1000.0;
			}
			while (i < trace.events.length) {
				let act = trace.events[i].attributes[activityKey];
				let thisTime = trace.events[i].attributes[timestampKey];
				if (act != null && thisTime != null) {
					act = act.value;
					thisTime = thisTime.value / 1000.0;
					if (!(act in maxTime)) {
						maxTime[act] = consideredTime - thisTime;
					}
					minTime[act] = consideredTime - thisTime;
				}
				i++;
			}
			let arr = [];			
			for (let act of activities) {
				if (act in minTime) {
					arr.push(minTime[act]);
					arr.push(maxTime[act]);
				}
				else {
					arr.push(naRep);
					arr.push(naRep);
				}
			}
			data.push(arr);
		}
		return [data, features];
	}
	
	static pathDuration(log, activityKey="concept:name", timestampKey="time:timestamp", naRep=-1) {
		let paths = Object.keys(FrequencyDfgDiscovery.apply(log, activityKey).pathsFrequency);
		let data = [];
		let features = [];
		for (let path of paths) {
			features.push("@@path_duration_min_"+path);
			features.push("@@path_duration_max_"+path);
		}
		for (let trace of log.traces) {
			let minPathDuration = {};
			let maxPathDuration = {};
			let i = 0;
			while (i < trace.events.length - 1) {
				let acti = trace.events[i].attributes[activityKey];
				let actj = trace.events[i+1].attributes[activityKey];
				let timei = trace.events[i].attributes[timestampKey];
				let timej = trace.events[i+1].attributes[timestampKey];
				if (acti != null && actj != null && timei != null && timej != null) {
					acti = acti.value;
					actj = actj.value;
					timei = timei.value / 1000;
					timej = timej.value / 1000;
					let path = acti + "," + actj;
					let thisdiff = timej - timei;
					if (!(path in minPathDuration)) {
						minPathDuration[path] = thisdiff;
						maxPathDuration[path] = thisdiff;
					}
					minPathDuration[path] = Math.min(thisdiff, minPathDuration[path]);
					maxPathDuration[path] = Math.max(thisdiff, maxPathDuration[path]);
				}
				let arr = [];
				for (let path of paths) {
					if (path in minPathDuration) {
						arr.push(minPathDuration[path]);
						arr.push(maxPathDuration[path]);
					}
					else {
						arr.push(naRep);
						arr.push(naRep);
					}
				}
				data.push(arr);
				i++;
			}
		}
		return [data, features];
	}
	
	static workInProgress(log, timestampKey="time:timestamp", caseIdKey="concept:name") {
		let tree = IntervalTreeBuilder.apply(log, timestampKey);
		let features = ["@@case_wip"];
		let data = [];
		let i = 0;
		while (i < log.traces.length) {
			let inte = {};
			if (log.traces[i].events.length > 0) {
				let st = log.traces[i].events[0].attributes[timestampKey].value / 1000.0;
				let et = log.traces[i].events[log.traces[i].events.length - 1].attributes[timestampKey].value / 1000.0;
				let intersectionAfterBefore = IntervalTreeAlgorithms.queryInterval(tree, st, et);
				for (let el of intersectionAfterBefore) {
					inte[el.value[0].attributes[caseIdKey].value] = 0;
				}
			}
			data.push([Object.keys(inte).length]);
			i++;
		}
		return [data, features];
	}
	
	static resourceWorkload(log, timestampKey="time:timestamp", resourceKey="org:resource") {
		let tree = IntervalTreeBuilder.apply(log, timestampKey);
		let resources = Object.keys(GeneralLogStatistics.getAttributeValues(log, resourceKey));
		let features = [];
		let data = [];
		for (let res of resources) {
			features.push("@@res_work_"+res);
		}
		let i = 0;
		while (i < log.traces.length) {
			let inte = {};
			if (log.traces[i].events.length > 0) {
				let st = log.traces[i].events[0].attributes[timestampKey].value / 1000.0;
				let et = log.traces[i].events[log.traces[i].events.length - 1].attributes[timestampKey].value / 1000.0;
				let intersectionAfterBefore = IntervalTreeAlgorithms.queryInterval(tree, st, et);
				for (let el of intersectionAfterBefore) {
					let eve = el.value[0].events[el.value[1]];
					let res = eve.attributes[resourceKey].value;
					if (!(res in inte)) {
						inte[res] = 0;
					}
					inte[res] += 1;
				}
			}
			let arr = [];
			for (let res of resources) {
				if (res in inte) {
					arr.push(inte[res]);
				}
				else {
					arr.push(0);
				}
			}
			data.push(arr);
			i++;
		}
		return [data, features];
	}
}

CaseFeatures.INCLUDE_WIP = false;
CaseFeatures.INCLUDE_RESOURCE_WORKLOAD = false;
try {
	require('../../pm4js.js');
	require('../discovery/dfg/algorithm.js');
	require('../../statistics/log/general.js');
	module.exports = {CaseFeatures: CaseFeatures};
	global.CaseFeatures = CaseFeatures;
}
catch (err) {
	// not in node
	//console.log(err);
}




class IntervalTreeBuilder {
	static apply(log, timestampKey="time:timestamp") {
		let tree = new IntervalTree();
		for (let trace of log.traces) {
			let i = 0;
			while (i < trace.events.length - 1) {
				let eve1 = trace.events[i];
				let eve2 = trace.events[i+1];
				tree.insert(eve1.attributes[timestampKey].value.getTime()/1000.0, eve2.attributes[timestampKey].value.getTime()/1000.0, [trace, i]);
				i++;
			}
		}
		let mintime = null;
		for (let n of tree.ascending()) {
			mintime = n.low;
			break;
		}
		let maxtime = null;
		for (let n of tree.descending()) {
			maxtime = n.high;
			break;
		}
		tree.mintime = mintime;
		tree.maxtime = maxtime;
		return tree;
	}
}

class IntervalTreeAlgorithms {
	static resourceWorkload(tree, pointOfTime=null, resourceKey="org:resource") {
		if (pointOfTime == null) {
			pointOfTime = (tree.mintime + tree.maxtime) / 2.0;
		}
		let contained = tree.queryPoint(pointOfTime);
		let returned = {};
		for (let p of contained) {
			let trace = p.value[0];
			let idx = p.value[1];
			let eve = trace.events[idx+1];
			let res = eve.attributes[resourceKey].value;
			if (!(res in returned)) {
				returned[res] = 1;
			}
			else {
				returned[res] += 1;
			}
		}
		return returned;
	}
	
	static targetActivityWorkload(tree, pointOfTime=null, activityKey="concept:name") {
		if (pointOfTime == null) {
			pointOfTime = (tree.mintime + tree.maxtime) / 2.0;
		}
		let contained = tree.queryPoint(pointOfTime);
		let returned = {};
		for (let p of contained) {
			let trace = p.value[0];
			let idx = p.value[1];
			let eve = trace.events[idx+1];
			let act = eve.attributes[activityKey].value;
			if (!(act in returned)) {
				returned[act] = 1;
			}
			else {
				returned[act] += 1;
			}
		}
		return returned;
	}
	
	static sourceActivityWorkload(tree, pointOfTime=null, activityKey="concept:name") {
		if (pointOfTime == null) {
			pointOfTime = (tree.mintime + tree.maxtime) / 2.0;
		}
		let contained = tree.queryPoint(pointOfTime);
		let returned = {};
		for (let p of contained) {
			let trace = p.value[0];
			let idx = p.value[1];
			let eve = trace.events[idx];
			let act = eve.attributes[activityKey].value;
			if (!(act in returned)) {
				returned[act] = 1;
			}
			else {
				returned[act] += 1;
			}
		}
		return returned;
	}
	
	static queryInterval(tree, st, et) {
		let afterIntersectingObjects0 = tree.queryAfterPoint(st);
		let beforeIntersectingObjects0 = tree.queryBeforePoint(et);
		let afterIntersectingObjects = [];
		let beforeIntersectingObjects = [];
		for (let obj of afterIntersectingObjects0) {
			afterIntersectingObjects.push(obj);
		}
		for (let obj of beforeIntersectingObjects0) {
			beforeIntersectingObjects.push(obj);
		}
		let intersectionAfterBefore = [];
		for (let obj of afterIntersectingObjects) {
			if (beforeIntersectingObjects.includes(obj)) {
				intersectionAfterBefore.push(obj);
			}
		}
		return intersectionAfterBefore;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {IntervalTreeBuilder: IntervalTreeBuilder, IntervalTreeAlgorithms: IntervalTreeAlgorithms};
	global.IntervalTreeBuilder = IntervalTreeBuilder;
	global.IntervalTreeAlgorithms = IntervalTreeAlgorithms;
}
catch (err) {
	// not in node
	//console.log(err);
}


const heapqTop = 0;
const heapqParent = i => ((i + 1) >>> 1) - 1;
const heapqLeft = i => (i << 1) + 1;
const heapqRight = i => (i + 1) << 1;

class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[heapqTop];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > heapqTop) {
      this._swap(heapqTop, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[heapqTop] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > heapqTop && this._greater(node, heapqParent(node))) {
      this._swap(node, heapqParent(node));
      node = heapqParent(node);
    }
  }
  _siftDown() {
    let node = heapqTop;
    while (
      (heapqLeft(node) < this.size() && this._greater(heapqLeft(node), node)) ||
      (heapqRight(node) < this.size() && this._greater(heapqRight(node), node))
    ) {
      let maxChild = (heapqRight(node) < this.size() && this._greater(heapqRight(node), heapqLeft(node))) ? heapqRight(node) : heapqLeft(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}

try {
	require('../../../pm4js.js');
	module.exports = {PriorityQueue: PriorityQueue};
	global.PriorityQueue = PriorityQueue;
}
catch (err) {
	// not in Node
	//console.log(err);
}


class PetriNetAlignmentsResults {
	constructor(logActivities, acceptingPetriNet, overallResult) {
		this.logActivities = logActivities;
		this.overallResult = overallResult;
		this.acceptingPetriNet = acceptingPetriNet;
		this.movesUsage = {};
		this.totalTraces = this.overallResult.length;
		this.fitTraces = 0;
		this.totalCost = 0;
		this.totalBwc = 0;
		this.averageTraceFitness = 0;
		for (let alTrace of this.overallResult) {
			if (alTrace != null) {
				for (let move of alTrace["alignment"].split(",")) {
					if (!(move in this.movesUsage)) {
						this.movesUsage[move] = 1;
					}
					else {
						this.movesUsage[move] += 1;
					}
				}
				if (alTrace["cost"] < 1) {
					this.fitTraces += 1;
				}
				this.totalBwc += alTrace["bwc"];
				this.totalCost += alTrace["cost"];
				this.averageTraceFitness += alTrace["fitness"];
			}
		}
		this.averageTraceFitness = this.averageTraceFitness / this.overallResult.length;
		this.logFitness = 1.0 - (this.totalCost)/(this.totalBwc);
		this.percentageFitTraces = this.fitTraces / this.totalTraces;
	}
}

class PetriNetAlignments {
	static apply(log, acceptingPetriNet, activityKey="concept:name", maxExecutionTime=Number.MAX_VALUE, syncCosts=null, modelMoveCosts=null, logMoveCosts=null) {
		let logActivities = GeneralLogStatistics.getAttributeValues(log, activityKey);
		if (syncCosts == null) {
			syncCosts = {};
			for (let transId in acceptingPetriNet.net.transitions) {
				syncCosts[transId] = 0;
			}
		}
		if (modelMoveCosts == null) {
			modelMoveCosts = {};
			for (let transId in acceptingPetriNet.net.transitions) {
				let trans = acceptingPetriNet.net.transitions[transId];
				if (trans.label == null) {
					let prem = trans.getPreMarking();
					let mark = new Marking(acceptingPetriNet.net);
					for (let pl in prem) {
						mark.setTokens(pl, prem[pl]);
					}
					let thisEnabledTransitions = mark.getEnabledTransitions();
					let visibleEnabledTransitions = [];
					for (let trans of thisEnabledTransitions) {
						if (trans.label != null) {
							visibleEnabledTransitions.push(trans);
						}
					}
					if (thisEnabledTransitions.length == 0) {
						modelMoveCosts[transId] = 0;
					}
					else {
						modelMoveCosts[transId] = 1;
					}
				}
				else {
					modelMoveCosts[transId] = 10000;
				}
			}
		}
		if (logMoveCosts == null) {
			logMoveCosts = {};
			for (let act in logActivities) {
				logMoveCosts[act] = 10000;
			}
		}
		let comparator = function(a, b) {
			let ret = false;
			if (a[0] < b[0]) {
				ret = true;
			}
			else if (a[0] > b[0]) {
				ret = false;
			}
			else {
				if (a[1] > b[1]) {
					ret = true;
				}
				else if (a[1] < b[1]) {
					ret = false;
				}
				else {
					if (a[2] < b[2]) {
						ret = true;
					}
					else if (a[2] > b[2]) {
						ret = false;
					}
				}
			}
			return ret;
		};
		let alignedTraces = {};
		let res = [];
		let count = 0;
		let minPathInModelCost = 0;
		try {
			minPathInModelCost = Math.floor(PetriNetAlignments.applyTrace([], acceptingPetriNet.net, acceptingPetriNet.im, acceptingPetriNet.fm, syncCosts, modelMoveCosts, logMoveCosts, comparator, maxExecutionTime)["cost"] / 10000);
		}
		catch (err) {
		}
		for (let trace of log.traces) {
			let bwc = trace.events.length + minPathInModelCost;
			let listAct = [];
			for (let eve of trace.events) {
				listAct.push(eve.attributes[activityKey].value);
			}
			if (!(listAct in alignedTraces)) {
				let ali = PetriNetAlignments.applyTrace(listAct, acceptingPetriNet.net, acceptingPetriNet.im, acceptingPetriNet.fm, syncCosts, modelMoveCosts, logMoveCosts, comparator, maxExecutionTime);
				let fitness = 1.0;
				if (ali != null) {
					let dividedCost = Math.floor(ali["cost"] / 10000);
					if (bwc > 0) {
						fitness = 1.0 - dividedCost / bwc;
					}
					ali["cost"] = dividedCost;
					ali["fitness"] = fitness;
					ali["bwc"] = bwc;
				}
				alignedTraces[listAct] = ali;
			}
			res.push(alignedTraces[listAct]);
			count++;
		}
		let ret = new PetriNetAlignmentsResults(logActivities, acceptingPetriNet, res);
		Pm4JS.registerObject(ret, "Petri nets Alignments Result");
		return ret;
	}
	
	static checkClosed(closedSet, tup) {
		if (tup[3] in closedSet) {
			if (tup[1] <= closedSet[tup[3]]) {
				return true;
			}
		}
		return false;
	}
	
	static closeTuple(closedSet, tup) {
		closedSet[tup[3]] = tup[1];
	}
	
	static applyTrace(listAct, net, im, fm, syncCosts, modelMoveCosts, logMoveCosts, comparator, maxExecutionTime) {
		let queue = new PriorityQueue(comparator);
		queue.push([0, 0, 0, im, false, null, null]);
		let count = 0;
		let closedSet = {};
		let startTime = (new Date()).getTime();
		while (true) {
			count++;
			let tup = queue.pop();
			if (tup == null) {
				return null;
			}
			else if (tup[3].equals(fm) && tup[1] == listAct.length) {
				return PetriNetAlignments.formAlignment(listAct, tup);
			}
			else if (PetriNetAlignments.checkClosed(closedSet, tup)) {
				continue;
			}
			else {
				let thisTime = (new Date()).getTime();
				if ((thisTime - startTime)/1000.0 > maxExecutionTime) {
					return null;
				}
				PetriNetAlignments.closeTuple(closedSet, tup);
				if (!(tup[3].equals(fm))) {
					let enabledTransitions = tup[3].getEnabledTransitions();
					for (let trans of enabledTransitions) {
						let newTup = null;
						if (tup[1] < listAct.length && trans.label == listAct[tup[1]]) {
							// sync move
							newTup = [tup[0] + syncCosts[trans.toString()], tup[1] + 1, count, tup[3].execute(trans), false, trans, tup];
							if (!(PetriNetAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
						else {
							// move on model
							newTup = [tup[0] + modelMoveCosts[trans.toString()], tup[1], count, tup[3].execute(trans), true, trans, tup];
							if (!(PetriNetAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
					}
				}
				if (tup[1] < listAct.length && !(tup[4])) {
					// move on log
					let newTup = [tup[0] + logMoveCosts[listAct[tup[1]]], tup[1] + 1, count, tup[3], false, null, tup];
					if (!(PetriNetAlignments.checkClosed(closedSet, newTup))) {
						queue.push(newTup);
					}
				}
			}
		}
	}
	
	static formAlignment(listAct, tup) {
		let ret = [];
		let cost = tup[0];
		let closedStates = tup[2];
		while (tup[6] != null) {
			let isMM = tup[4];
			let currTrans = tup[5];
			if (currTrans == null) {
				// lm
				ret.push("("+listAct[tup[1]-1]+";>>)")
			}
			else if (isMM) {
				ret.push("(>>;"+currTrans.name+")")
			}
			else {
				ret.push("("+listAct[tup[1]-1]+";"+currTrans.name+")")
			}
			tup = tup[6];
		}
		ret.reverse();
		return {"alignment": ret.join(","), "cost": cost, "closedStates": closedStates}
	}
}

try {
	require('../../../../pm4js.js');
	require('../heapq.js');
	require('../../../../statistics/log/general.js');
	module.exports = {PetriNetAlignments: PetriNetAlignments, PetriNetAlignmentsResults: PetriNetAlignmentsResults};
	global.PetriNetAlignments = PetriNetAlignments;
	global.PetriNetAlignmentsResults = PetriNetAlignmentsResults;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("PetriNetAlignments", "apply", ["EventLog", "AcceptingPetriNet"], "PetriNetAlignmentsResults", "Perform Alignments on Petri nets", "Alessandro Berti");


class DfgAlignmentsResults {
	constructor(logActivities, frequencyDfg, overallResult) {
		this.logActivities = logActivities;
		this.overallResult = overallResult;
		this.frequencyDfg = frequencyDfg;
		this.movesUsage = {};
		this.totalTraces = this.overallResult.length;
		this.fitTraces = 0;
		this.totalCost = 0;
		this.totalBwc = 0;
		this.averageTraceFitness = 0;
		for (let alTrace of this.overallResult) {
			for (let move of alTrace["alignment"].split(",")) {
				if (!(move in this.movesUsage)) {
					this.movesUsage[move] = 1;
				}
				else {
					this.movesUsage[move] += 1;
				}
			}
			if (alTrace["cost"] < 1) {
				this.fitTraces += 1;
			}
			this.totalCost += alTrace["cost"];
			this.totalBwc += alTrace["bwc"];
			this.averageTraceFitness += alTrace["fitness"];
		}
		this.averageTraceFitness = this.averageTraceFitness / this.overallResult.length;
		this.logFitness = 1.0 - (this.totalCost)/(this.totalBwc);
		this.percentageFitTraces = this.fitTraces / this.totalTraces;
	}
}

class DfgAlignments {
	static apply(log, frequencyDfg0, activityKey="concept:name", syncCosts=null, modelMoveCosts=null, logMoveCosts=null) {
		let logActivities = GeneralLogStatistics.getAttributeValues(log, activityKey);
		let frequencyDfg = frequencyDfg0.getArtificialDfg();
		let outgoing = {};
		for (let arc0 in frequencyDfg[1]) {
			let arc = arc0.split(",");
			if (!(arc[0] in outgoing)) {
				outgoing[arc[0]] = [];
			}
			outgoing[arc[0]].push(arc[1]);
		}
		if (syncCosts == null) {
			syncCosts = {};
			for (let act in frequencyDfg[0]) {
				syncCosts[act] = 0;
			}
		}
		if (modelMoveCosts == null) {
			modelMoveCosts = {};
			for (let act in frequencyDfg[0]) {
				if (act == "■") {
					modelMoveCosts[act] = 0;
				}
				else {
					modelMoveCosts[act] = 10000;
				}
			}
		}
		if (logMoveCosts == null) {
			logMoveCosts = {};
			for (let act in logActivities) {
				logMoveCosts[act] = 10000;
			}
		}
		let comparator = function(a, b) {
			let ret = false;
			if (a[0] < b[0]) {
				ret = true;
			}
			else if (a[0] > b[0]) {
				ret = false;
			}
			else {
				if (a[1] > b[1]) {
					ret = true;
				}
				else if (a[1] < b[1]) {
					ret = false;
				}
				else {
					if (a[2] < b[2]) {
						ret = true;
					}
					else if (a[2] > b[2]) {
						ret = false;
					}
				}
			}
			return ret;
		};
		let alignedTraces = {};
		let res = [];
		let count = 0;
		let minPathInModelCost = Math.floor(DfgAlignments.applyTrace([], frequencyDfg, outgoing, syncCosts, modelMoveCosts, logMoveCosts, comparator)["cost"] / 10000);
		for (let trace of log.traces) {
			let bwc = trace.events.length + minPathInModelCost;
			let listAct = [];
			for (let eve of trace.events) {
				listAct.push(eve.attributes[activityKey].value);
			}
			if (!(listAct in alignedTraces)) {
				let ali = DfgAlignments.applyTrace(listAct, frequencyDfg, outgoing, syncCosts, modelMoveCosts, logMoveCosts, comparator);
				let fitness = 1.0;
				let dividedCost = Math.floor(ali["cost"] / 10000);
				if (bwc > 0) {
					fitness = 1.0 - dividedCost / bwc;
				}
				ali["cost"] = dividedCost;
				ali["fitness"] = fitness;
				ali["bwc"] = bwc;
				alignedTraces[listAct] = ali;
			}
			res.push(alignedTraces[listAct]);
			count++;
		}
		let ret = new DfgAlignmentsResults(logActivities, frequencyDfg0, res);
		Pm4JS.registerObject(ret, "DFG Alignments Result");
		return ret;
	}
	
	static checkClosed(closedSet, tup) {
		if (tup[3] in closedSet) {
			if (tup[1] <= closedSet[tup[3]]) {
				return true;
			}
		}
		return false;
	}
	
	static closeTuple(closedSet, tup) {
		closedSet[tup[3]] = tup[1];
	}
	
	static applyTrace(listAct, frequencyDfg, outgoing, syncCosts, modelMoveCosts, logMoveCosts, comparator) {
		let queue = new PriorityQueue(comparator);
		queue.push([0, 0, 0, "▶", false, null, null]);
		let count = 0;
		let closedSet = {};
		while (true) {
			count++;
			let tup = queue.pop();
			if (tup == null) {
				return null;
			}
			else if (tup[3] == "■" && tup[1] == listAct.length) {
				return DfgAlignments.formAlignment(listAct, tup);
			}
			else if (DfgAlignments.checkClosed(closedSet, tup)) {
				continue;
			}
			else {
				DfgAlignments.closeTuple(closedSet, tup);
				if (tup[3] != "■") {
					let enabledTransitions = outgoing[tup[3]];
					for (let trans of enabledTransitions) {
						let newTup = null;
						if (tup[1] < listAct.length && trans == listAct[tup[1]]) {
							// sync move
							newTup = [tup[0] + syncCosts[trans], tup[1] + 1, count, trans, false, trans, tup];
							if (!(DfgAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
						else {
							// move on model
							newTup = [tup[0] + modelMoveCosts[trans], tup[1], count, trans, true, trans, tup];
							if (!(DfgAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
					}
				}
				if (tup[1] < listAct.length && !(tup[4])) {
					// move on log
					let newTup = [tup[0] + logMoveCosts[listAct[tup[1]]], tup[1] + 1, count, tup[3], false, null, tup];
					if (!(DfgAlignments.checkClosed(closedSet, newTup))) {
						queue.push(newTup);
					}
				}
			}
		}
		return null;
	}
	
	static formAlignment(listAct, tup) {
		let ret = [];
		let cost = tup[0];
		let closedStates = tup[2];
		tup = tup[6];
		while (tup[6] != null) {
			let isMM = tup[4];
			let currTrans = tup[5];
			if (currTrans == null) {
				// lm
				ret.push("("+listAct[tup[1]-1]+";>>)")
			}
			else if (isMM) {
				ret.push("(>>;"+currTrans+")")
			}
			else {
				ret.push("("+listAct[tup[1]-1]+";"+currTrans+")")
			}
			tup = tup[6];
		}
		ret.reverse();
		return {"alignment": ret.join(","), "cost": cost, "closedStates": closedStates}
	}
}

try {
	require('../../../../pm4js.js');
	require('../heapq.js');
	require('../../../../statistics/log/general.js');
	module.exports = {DfgAlignments: DfgAlignments, DfgAlignmentsResults: DfgAlignmentsResults};
	global.DfgAlignments = DfgAlignments;
	global.DfgAlignmentsResults = DfgAlignmentsResults;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("DfgAlignments", "apply", ["EventLog", "FrequencyDfg"], "DfgAlignmentsResults", "Perform Alignments on DFG", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgAlignments", "apply", ["EventLog", "PerformanceDfg"], "DfgAlignmentsResults", "Perform Alignments on DFG", "Alessandro Berti");


class DfgPlayout {
	static apply(freqDfg, numDesideredTraces=1000, activityKey="concept:name", timestampKey="time:timestamp") {
		let vect = freqDfg.getArtificialDfg();
		let outgoing = {};
		for (let act in vect[0]) {
			outgoing[act] = {};
		}
		for (let edge0 in vect[1]) {
			let edge = edge0.split(",");
			outgoing[edge[0]][edge[1]] = -Math.log(vect[1][edge0] / (0.0 + vect[0][edge[0]]));
		}
		let comparator = function(a,b) {
			return a[1] < b[1];
		};
		let queue = new PriorityQueue(comparator);
		let start = [["▶"], 0];
		queue.push(start);
		let count = 0;
		let minTimestamp = 10000000;
		let eventLog = new EventLog();
		while (true) {
			if (count >= numDesideredTraces) {
				break;
			}
			let el = queue.pop();
			let activities = el[0];
			let lastActivity = activities[activities.length-1];
			if (lastActivity == "■") {
				let prob = Math.exp(-el[1]);
				let trace = new Trace();
				trace.attributes["@@prob"] = new Attribute(prob);
				trace.attributes["concept:name"] = new Attribute(""+count);
				eventLog.traces.push(trace);
				let i = 1;
				while (i < activities.length - 1) {
					let newEve = new Event();
					trace.events.push(newEve);
					newEve.attributes[activityKey] = new Attribute(activities[i]);
					newEve.attributes[timestampKey] = new Attribute(new Date((minTimestamp + count)*1000));
					i++;
				}
				count++;
			}
			for (let act in outgoing[lastActivity]) {
				let newActivities = activities.slice();
				newActivities.push(act);
				queue.push([newActivities, el[1] + outgoing[lastActivity][act]]);
			}
		}
		Pm4JS.registerObject(eventLog, "Simulated Event log (from DFG)");
		return eventLog;
	}
}

try {
	require('../../../../pm4js.js');
	require('../../../conformance/alignments/heapq.js');
	module.exports = {DfgPlayout: DfgPlayout};
	global.DfgPlayout = DfgPlayout;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("DfgPlayout", "apply", ["FrequencyDfg"], "EventLog", "Perform Playout on a DFG", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgPlayout", "apply", ["PerformanceDfg"], "EventLog", "Perform Playout on a DFG", "Alessandro Berti");


class FilteredDfgMaximization {
	static apply(freqDfg) {
		let vect = freqDfg.getArtificialDfg();
		let activities = vect[0];
		let paths = vect[1];
		let activitiesKeys = Object.keys(activities);
		let ingoing = {};
		let outgoing = {};
		for (let act of activitiesKeys) {
			if (act != "▶") {
				ingoing[act] = {};
			}
			if (act != "■") {
				outgoing[act] = {};
			}
		}
		let pathsKeys = Object.keys(paths);
		for (let path0 of pathsKeys) {
			let path = path0.split(",");
			ingoing[path[1]][path[0]] = paths[path0];
			outgoing[path[0]][path[1]] = paths[path0];
		}
		let constraintMatrix = [];
		let constraintsVector = [];
		let numConstraints = pathsKeys.length + activitiesKeys.length + activitiesKeys.length;
		let zeroRow = [];
		let i = 0;
		while (i < numConstraints) {
			zeroRow.push(0);
			i++;
		}
		for (let pind in pathsKeys) {
			let constraintRow = zeroRow.slice();
			constraintRow[parseInt(pind)] = -1;
			constraintMatrix.push(constraintRow);
			constraintsVector.push(-paths[pathsKeys[parseInt(pind)]]);
		}
		for (let actInd in activitiesKeys) {
			let act = activitiesKeys[actInd];
			let constraintRow = zeroRow.slice();
			for (let act2 in ingoing[act]) {
				let path = [act2, act];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = 1;
			}
			constraintRow[pathsKeys.length + parseInt(actInd)] = 1;
			constraintsVector.push(activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			for (let act2 in ingoing[act]) {
				let path = [act2, act];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = -1;
			}
			constraintRow[pathsKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(-activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			constraintRow[pathsKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(0);
			constraintMatrix.push(constraintRow);
		}
		for (let actInd in activitiesKeys) {
			let act = activitiesKeys[actInd];
			let constraintRow = zeroRow.slice();
			for (let act2 in outgoing[act]) {
				let path = [act, act2];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = 1;
			}
			constraintRow[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = 1;
			constraintsVector.push(activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			for (let act2 in outgoing[act]) {
				let path = [act, act2];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = -1;
			}
			constraintRow[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(-activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			constraintRow[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(0);
			constraintMatrix.push(constraintRow);
		}
		let objective = zeroRow.slice();
		for (let actInd in activitiesKeys) {
			objective[pathsKeys.length + parseInt(actInd)] = 1;
			objective[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = 1;
		}
		var lp = numeric.solveLP(objective, constraintMatrix, constraintsVector);
		for (let pind in pathsKeys) {
			let val = Math.floor(lp.solution[pind]);
			if (val != paths[pathsKeys[pind]]) {
				paths[pathsKeys[pind]] = val;
			}
		}
		let ret = freqDfg.unrollArtificialDfg([activities, paths]);
		Pm4JS.registerObject(ret, "Maximized DFG");
		return ret;
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {FilteredDfgMaximization: FilteredDfgMaximization};
	global.FilteredDfgMaximization = FilteredDfgMaximization;
}
catch (err) {
	// not in Node
}

Pm4JS.registerAlgorithm("FilteredDfgMaximization", "apply", ["FrequencyDfg"], "FrequencyDfg", "Maximize DFG capacity", "Alessandro Berti");
Pm4JS.registerAlgorithm("FilteredDfgMaximization", "apply", ["PerformanceDfg"], "PerformanceDfg", "Maximize DFG capacity", "Alessandro Berti");


class EventLogPrefixes {
	static apply(eventLog, activityKey="concept:name") {
		let prefixes = {};
		let i = 0;
		for (let trace of eventLog.traces) {
			i = 0;
			let actArray = [];
			while (i < trace.events.length - 1) {
				let act = trace.events[i].attributes[activityKey].value;
				let nextAct = trace.events[i+1].attributes[activityKey].value;
				actArray.push(act);
				if (!(actArray in prefixes)) {
					prefixes[actArray] = {};
				}
				if (!(nextAct in prefixes[actArray])) {
					prefixes[actArray][nextAct] = 0;
				}
				prefixes[actArray][nextAct] += 1;
				i++;
			}
		}
		return prefixes;
	}
}

try {
	require('../../../pm4js.js');
	require('../log.js');
	module.exports = {EventLogPrefixes: EventLogPrefixes};
	global.EventLogPrefixes = EventLogPrefixes;
}
catch (err) {
	// not in node
	//console.log(err);
}


class TbrFitness {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		return TokenBasedReplay.apply(eventLog, acceptingPetriNet, activityKey);
	}
	
	static evaluate(tbrResults) {
		return tbrResults;
	}
}

try {
	require("../../../../pm4js.js");
	require("../../../conformance/tokenreplay/algorithm.js");
	module.exports = {TbrFitness: TbrFitness};
	global.TbrFitness = TbrFitness;
}
catch (err) {
	// not in Node
	//console.log(err);
}


class AlignmentsFitness {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		return PetriNetAlignments.apply(eventLog, acceptingPetriNet, activityKey);
	}
	
	static evaluate(alignResults) {
		return alignResults;
	}
}

try {
	require("../../../../pm4js.js");
	require("../../../conformance/alignments/petri_net/algorithm.js");
	module.exports = {AlignmentsFitness: AlignmentsFitness};
	global.AlignmentsFitness = AlignmentsFitness;
}
catch (err) {
	// not in Node
	//console.log(err);
}


class ETConformanceResult {
	constructor(activatedTransitions, escapingEdges, precision) {
		this.activatedTransitions = activatedTransitions;
		this.escapingEdges = escapingEdges;
		this.precision = precision;
	}
}

class ETConformance {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		let prefixes = EventLogPrefixes.apply(eventLog, activityKey);
		let prefixesKeys = Object.keys(prefixes);
		let ret = TokenBasedReplay.applyListListAct(prefixesKeys, acceptingPetriNet, false, true);
		let i = 0;
		let sum_at = 0;
		let sum_ee = 0;
		let logTransitions = Object.keys(GeneralLogStatistics.getStartActivities(eventLog, activityKey));
		let activatedTransitions = PetriNetReachableVisibleTransitions.apply(acceptingPetriNet.net, acceptingPetriNet.im);
		let escapingEdges = [];
		for (let at of activatedTransitions) {
			if (!(logTransitions.includes(at))) {
				escapingEdges.push(at);
			}
		}
		sum_at += activatedTransitions.length * eventLog.traces.length;
		sum_ee += escapingEdges.length * eventLog.traces.length;
		i = 0;
		while (i < prefixesKeys.length) {
			if (ret[i].isFit) {
				let activatedTransitions = PetriNetReachableVisibleTransitions.apply(acceptingPetriNet.net, ret[i]);
				let prefix = prefixesKeys[i];
				let logTransitions = Object.keys(prefixes[prefix]);
				let sumPrefix = 0;
				for (let transition of logTransitions) {
					sumPrefix += prefixes[prefix][transition];
				}
				let escapingEdges = [];
				for (let at of activatedTransitions) {
					if (!(logTransitions.includes(at))) {
						escapingEdges.push(at);
					}
				}
				sum_at += activatedTransitions.length * sumPrefix;
				sum_ee += escapingEdges.length * sumPrefix;
			}
			i++;
		}
		let precision = 1.0;
		if (sum_at > 0) {
			precision = 1.0 - (sum_ee / (0.0 + sum_at));
		}
		let finalResult = new ETConformanceResult(sum_at, sum_ee, precision);
		Pm4JS.registerObject(finalResult, "ETConformance Precision Results");
		return finalResult;
	}
}

try {
	require("../../../../pm4js.js");
	require("../../../../objects/petri_net/petri_net.js");
	require("../../../../objects/petri_net/util/reachable_visible_transitions.js");
	require("../../../../statistics/log/general.js");
	module.exports = {ETConformance: ETConformance, ETConformanceResult: ETConformanceResult};
	global.ETConformance = ETConformance;
	global.ETConformanceResult = ETConformanceResult;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("ETConformance", "apply", ["EventLog", "AcceptingPetriNet"], "ETConformanceResult", "Calculate Precision (ETConformance based on TBR)", "Alessandro Berti");


class BpmnGraph {
	constructor(id="", name="") {
		this.id = id;
		this.name = name;
		this.nodes = {};
		this.edges = {};
		this.properties = {};
	}
	
	addNode(id) {
		if (id == null) {
			throw "addNode called with id=null";
		}
		if (id in this.nodes) {
			return this.nodes[id];
		}
		this.nodes[id] = new BpmnNode(this, id);
		return this.nodes[id];
	}
	
	addEdge(id) {
		if (id == null) {
			throw "addEdge called with id=null";
		}
		if (id in this.edges) {
			return this.edges[id];
		}
		this.edges[id] = new BpmnEdge(this, id);
		return this.edges[id];
	}
	
	toString() {
		return this.id;
	}
	
	removeNode(id) {
		if (id == null) {
			throw "removeNode called with id=null";
		}
		if (id in this.nodes) {
			let node = this.nodes[id];
			for (let edgeId in node.incoming) {
				let edge = node.incoming[edgeId];
				let source = edge.source;
				delete source.outgoing[edge];
				delete this.edges[edge];
			}
			for (let edgeId in node.outgoing) {
				let edge = node.outgoing[edgeId];
				let target = edge.target;
				delete target.incoming[edge];
				delete this.edges[edge];
			}
			delete this.nodes[id];
		}
	}
	
	getOrderedNodesAndEdges() {
		let startEvent = null;
		for (let nodeId in this.nodes) {
			let node = this.nodes[nodeId];
			node.level = Number.MAX_SAFE_INTEGER;
			if (node.type == "startEvent") {
				startEvent = nodeId;
				node.level = 0;
			}
		}
		let toVisit = [startEvent];
		let visited = {};
		let orderedNodes = [];
		let outgoingEdges = {};
		while (toVisit.length > 0) {
			let el = toVisit.pop();
			if (!(el in visited)) {
				visited[el] = 0;
				orderedNodes.push(el);
				
				let thisNode = this.nodes[el];
				for (let outEdgeId in thisNode.outgoing) {
					let outEdge = this.edges[outEdgeId];
					let targetId = outEdge.target.id;
					let targetNode = this.nodes[targetId];
					if (!(targetId in visited)) {
						toVisit.push(targetId);
						targetNode.level = Math.min(targetNode.level, thisNode.level + 1);
					}
					outgoingEdges[[el, targetId]] = 0;
				}
			}
		}
		for (let nodeId in this.nodes) {
			if (!(nodeId in visited)) {
				visited[nodeId] = 0;
				orderedNodes.push(nodeId);
			}
		}
		orderedNodes.sort((a, b) => {
			let nodeA = this.nodes[a];
			let nodeB = this.nodes[b];
			if (nodeA.level < nodeB.level) {
				return -1;
			}
			else if (nodeA.level > nodeB.level) {
				return 1;
			}
			else {
				return 0;
			}
		});
		
		let orderedEdges = [];
		let invMap = {};
		for (let nodeId of orderedNodes) {
			let node = this.nodes[nodeId];
			for (let edgeId in node.outgoing) {
				let edge = this.edges[edgeId];
				orderedEdges.push([edge.source.id, edge.target.id]);
				invMap[[edge.source.id, edge.target.id]] = edge.id;
			}
		}
		
		return {"nodesId": orderedNodes, "edgesId": orderedEdges, "invMap": invMap};
	}
}

class BpmnNode {
	constructor(graph, id) {
		this.graph = graph;
		this.id = id;
		this.name = "";
		this.type = null;
		this.incoming = {};
		this.outgoing = {};
		this.bounds = {};
		this.properties = {};
	}
	
	addIncoming(id) {
		if (id == null) {
			throw "addIncoming called with id=null";
		}
		let edge = this.graph.addEdge(id);
		this.incoming[id] = edge;
	}
	
	addOutgoing(id) {
		if (id == null) {
			throw "addOutgoing called with id=null";
		}
		let edge = this.graph.addEdge(id);
		this.outgoing[id] = edge;
	}
	
	toString() {
		return this.id;
	}
}

class BpmnEdge {
	constructor(graph, id) {
		this.graph = graph;
		this.id = id;
		this.name = "";
		this.source = null;
		this.target = null;
		this.waypoints = [];
		this.properties = {};
	}
	
	setSource(id) {
		if (id == null) {
			throw "setSource called with id=null";
		}
		if (!(id in this.graph.nodes)) {
			console.log("creating node with ID "+id+" before node instantiation");
		}
		let sourceNode = this.graph.addNode(id);
		sourceNode.outgoing[this.id] = this;
		this.source = sourceNode;
	}
	
	setTarget(id) {
		if (id == null) {
			throw "setTarget called with id=null";
		}
		if (!(id in this.graph.nodes)) {
			console.log("creating node with ID "+id+" before node instantiation");
		}
		let targetNode = this.graph.addNode(id);
		targetNode.incoming[this.id] = this;
		this.target = targetNode;
	}
	
	toString() {
		return this.id;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {BpmnGraph: BpmnGraph, BpmnNode: BpmnNode, BpmnEdge: BpmnEdge};
	global.BpmnGraph = BpmnGraph;
	global.BpmnNode = BpmnNode;
	global.BpmnEdge = BpmnEdge;
}
catch (err) {
	// not in node
}

class BpmnImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let definitions = null;
		for (let childId in xmlDoc.childNodes) {
			let child = xmlDoc.childNodes[childId];
			if (child.tagName != null && child.tagName.endsWith("definitions")) {
				definitions = child;
			}
		}
		let bpmnGraph = new BpmnGraph();
		BpmnImporter.parseRecursive(definitions, null, bpmnGraph);
		
		Pm4JS.registerObject(bpmnGraph, "BPMN graph imported from a .bpmn file");

		return bpmnGraph;
	}
	
	static parseRecursive(el, thisParent, bpmnGraph) {
		if (el.tagName != null) {
			if (el.tagName.endsWith("BPMNDiagram")) {
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "id") {
						bpmnGraph.id = attr.value;
					}
					else if (attr.name == "name") {
						bpmnGraph.name = attr.value;
					}
					else {
						if (attr.value != null) {
							bpmnGraph.properties[attr.name] = attr.value;
						}
					}
				}
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("definitions")) {
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("process")) {
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("BPMNPlane")) {
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("BPMNShape")) {
				let nodeId = null;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "bpmnElement") {
						nodeId = attr.value;
					}
				}
				let bpmnNode = bpmnGraph.addNode(nodeId);
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, bpmnNode, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("Bounds")) {
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.value != null) {
						thisParent.bounds[attr.name] = attr.value;
					}
				}
			}
			else if (el.tagName.endsWith("BPMNEdge")) {
				let edgeId = null;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "bpmnElement") {
						edgeId = attr.value;
					}
				}
				let bpmnEdge = bpmnGraph.addEdge(edgeId);
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, bpmnEdge, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("waypoint")) {
				let this_X = "0";
				let this_Y = "0";
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "x") {
						this_X = attr.value;
					}
					else if (attr.name == "y") {
						this_Y = attr.value;
					}
				}
				this_X = parseInt(this_X);
				this_Y = parseInt(this_Y);
				thisParent.waypoints.push([this_X, this_Y]);
			}
			else if (el.tagName.toLowerCase().endsWith("flow")) {
				let flowId = null;
				let flowName = "";
				let flowSourceRef = null;
				let flowTargetRef = null;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "id") {
						flowId = attr.value;
					}
					else if (attr.name == "name") {
						flowName = attr.value;
					}
					else if (attr.name == "sourceRef") {
						flowSourceRef = attr.value;
					}
					else if (attr.name == "targetRef") {
						flowTargetRef = attr.value;
					}
				}
				let bpmnEdge = bpmnGraph.addEdge(flowId);
				bpmnEdge.name = flowName;
				bpmnEdge.setSource(flowSourceRef);
				bpmnEdge.setTarget(flowTargetRef);
			}
			else if (thisParent != null && thisParent.constructor.name == "BpmnNode") {
				if (el.tagName == "incoming") {
					thisParent.addIncoming(el.textContent);					
				}
				else if (el.tagName == "outgoing") {
					thisParent.addOutgoing(el.textContent);
				}
			}
			else {
				let nodeId = null;
				let nodeName = "";
				let nodeType = el.tagName;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "id") {
						nodeId = attr.value;
					}
					else if (attr.name == "name") {
						nodeName = attr.value;
					}
				}
				let bpmnNode = bpmnGraph.addNode(nodeId);
				bpmnNode.name = nodeName;
				bpmnNode.type = nodeType.split(":");
				bpmnNode.type = bpmnNode.type[bpmnNode.type.length - 1];
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.value != null) {
						if (attr.name != "id" && attr.name != "name") {
							bpmnNode.properties[attr.name] = attr.value;
						}
					}
				}
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, bpmnNode, bpmnGraph);
				}
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../bpmn_graph.js');
	module.exports = {BpmnImporter: BpmnImporter};
	global.BpmnImporter = BpmnImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerImporter("BpmnImporter", "apply", ["bpmn"], "BPMN Importer", "Alessandro Berti");


class BpmnExporter {
		static uuidv4() {
		  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		  });
		}
		
		static nodeUuid() {
			let uuid = BpmnExporter.uuidv4();
			return "id"+uuid.replace(/-/g, "");
		}
	
	static apply(bpmnGraph) {
		let definitions = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"definitions");
		let processId = BpmnExporter.nodeUuid();
		definitions.setAttribute("xmlns:bpmn", "http://www.omg.org/spec/BPMN/20100524/MODEL");
		definitions.setAttribute("xmlns:bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI");
		definitions.setAttribute("xmlns:omgdc", "http://www.omg.org/spec/DD/20100524/DC");
		definitions.setAttribute("xmlns:omgdi", "http://www.omg.org/spec/DD/20100524/DI");
		definitions.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
		definitions.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
		definitions.setAttribute("targetNamespace", "http://www.signavio.com/bpmn20");
		definitions.setAttribute("typeLanguage", "http://www.w3.org/2001/XMLSchema");
		definitions.setAttribute("expressionLanguage", "http://www.w3.org/1999/XPath");
		let bpmnDiagram = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNDiagram");
		definitions.appendChild(bpmnDiagram);
		bpmnDiagram.setAttribute("id", bpmnGraph.id);
		bpmnDiagram.setAttribute("name", bpmnGraph.name);
		let bpmnPlane = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNPlane");
		bpmnDiagram.appendChild(bpmnPlane);
		bpmnPlane.setAttribute("id", BpmnExporter.nodeUuid());
		bpmnPlane.setAttribute("bpmnElement", processId);
		for (let nodeId in bpmnGraph.nodes) {
			let node = bpmnGraph.nodes[nodeId];
			let shape = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNShape");
			shape.setAttribute("bpmnElement", nodeId);
			shape.setAttribute("id", nodeId+"_gui");
			let bounds = document.createElementNS("", "omgdc"+BpmnExporter.DUMMY_SEP+"Bounds");
			if (Object.keys(node.bounds).length > 0) {
				for (let prop in node.bounds) {
					bounds.setAttribute(prop, ""+node.bounds[prop]);
				}
			}
			else {
				// layouting has not been done. exports with default
				bounds.setAttribute("width", 100);
				bounds.setAttribute("height", 100);
				bounds.setAttribute("x", 0);
				bounds.setAttribute("y", 0);
			}
			shape.appendChild(bounds);
			bpmnPlane.appendChild(shape);
		}
		for (let edgeId in bpmnGraph.edges) {
			let edge = bpmnGraph.edges[edgeId];
			let xmlEdge = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNEdge");
			xmlEdge.setAttribute("bpmnElement", edgeId);
			xmlEdge.setAttribute("id", edgeId+"_gui");
			if (Object.keys(edge.waypoints).length > 0) {
				for (let waypoint of edge.waypoints) {
					let xmlWaypoint = document.createElementNS("", "omgdi"+BpmnExporter.DUMMY_SEP+"waypoint");
					xmlWaypoint.setAttribute("x", ""+waypoint[0]);
					xmlWaypoint.setAttribute("y", ""+waypoint[1]);
					xmlEdge.appendChild(xmlWaypoint);
				}
			}
			else {
				// layouting has not been done. exports with default
					let xmlWaypoint = document.createElementNS("", "omgdi"+BpmnExporter.DUMMY_SEP+"waypoint");
					xmlWaypoint.setAttribute("x", 0);
					xmlWaypoint.setAttribute("y", 0);
					xmlEdge.appendChild(xmlWaypoint);
			}
			bpmnPlane.appendChild(xmlEdge);
		}
		//<process id="id071a1d8d-32e0-4b39-ae20-8ab8c71faec3" isClosed="false" isExecutable="false" processType="None">
		let process = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"process");
		process.setAttribute("id", processId);
		process.setAttribute("isClosed", "false");
		process.setAttribute("isExecutable", "false");
		process.setAttribute("processType", "null");
		definitions.appendChild(process);
		for (let nodeId in bpmnGraph.nodes) {
			let node = bpmnGraph.nodes[nodeId];
			let xmlNode = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+node.type);
			xmlNode.setAttribute("id", nodeId);
			xmlNode.setAttribute("name", node.name);
			for (let prop in node.properties) {
				xmlNode.setAttribute(prop, node.properties[prop]);
			}
			for (let inc in node.incoming) {
				let xmlInc = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"incoming");
				xmlInc.textContent = inc;
				xmlNode.appendChild(xmlInc);
			}
			for (let out in node.outgoing) {
				let xmlOut = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"outgoing");
				xmlOut.textContent = out;
				xmlNode.appendChild(xmlOut);
			}
			process.appendChild(xmlNode);
		}
		for (let edgeId in bpmnGraph.edges) {
			let edge = bpmnGraph.edges[edgeId];
			let xmlEdge = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"sequenceFlow");
			xmlEdge.setAttribute("id", edgeId);
			xmlEdge.setAttribute("name", edge.name);
			xmlEdge.setAttribute("sourceRef", edge.source.id);
			xmlEdge.setAttribute("targetRef", edge.target.id);
			process.appendChild(xmlEdge);
		}
		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		let xmlStr = serializer.serializeToString(definitions);
		xmlStr = xmlStr.replace(/AIOEWFRIUOERWQIO/g, ":");
		return xmlStr;
	}
}

// unlikely string, better look at other solutions ...
BpmnExporter.DUMMY_SEP = "AIOEWFRIUOERWQIO";

try {
	require('../../../pm4js.js');
	require('../bpmn_graph.js');
	module.exports = {BpmnExporter: BpmnExporter};
	global.BpmnExporter = BpmnExporter;
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
}
catch (err) {
	// not in node
	//console.log(err);
}

Pm4JS.registerExporter("BpmnExporter", "apply", "BpmnGraph", "bpmn", "text/xml", "BPMN Exporter (.bpmn)", "Alessandro Berti");


class BpmnToPetriNetConverter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = BpmnToPetriNetConverter.uuidv4();
		return "id"+uuid.replace(/-/g, "");
	}
		
	static apply(bpmnGraph) {
		let petriNet = new PetriNet("converted from BPMN");
		let im = new Marking(petriNet);
		let fm = new Marking(petriNet);
		let sourcePlace = petriNet.addPlace("source");
		let sinkPlace = petriNet.addPlace("sink");
		im.setTokens(sourcePlace, 1);
		fm.setTokens(sinkPlace, 1);
		let inclusiveGatewayEntry = {};
		let inclusiveGatewayExit = {};
		let flowPlace = {};
		let sourceCount = {};
		let targetCount = {};
		for (let flowId in bpmnGraph.edges) {
			let flow = bpmnGraph.edges[flowId];
			let source = flow.source;
			let target = flow.target;
			let place = petriNet.addPlace(flowId);
			flowPlace[flow] = place;
			if (!(source in sourceCount)) {
				sourceCount[source] = 0;
			}
			if (!(target in targetCount)) {
				targetCount[target] = 0;
			}
			sourceCount[source] = sourceCount[source] + 1;
			targetCount[target] = targetCount[target] + 1;
		}
		for (let flowId in bpmnGraph.edges) {
			let flow = bpmnGraph.edges[flowId];
			let source = flow.source;
			let target = flow.target;
			if (source.type.endsWith("inclusiveGateway") && sourceCount[source] > 1) {
				inclusiveGatewayExit[flowId] = 0;
			}
			if (target.type.endsWith("inclusiveGateway") && targetCount[target] > 1) {
				inclusiveGatewayEntry[flowId] = 0;
			}
		}
		let inclusivGatInters = {};
		for (let el in inclusiveGatewayEntry) {
			if (el in inclusiveGatewayExit) {
				inclusivGatInters[el] = 0;
			}
		}
		
		let nodesEntering = {};
		let nodesExiting = {};
		for (let nodeId in bpmnGraph.nodes) {
			let node = bpmnGraph.nodes[nodeId];
			let entryPlace = petriNet.addPlace("ent_"+nodeId);
			let exitingPlace = petriNet.addPlace("exi_"+nodeId);
			let label = null;
			if (node.type.toLowerCase().endsWith("task")) {
				label = node.name;
			}
			let transition = petriNet.addTransition(nodeId, label);
			petriNet.addArcFromTo(entryPlace, transition);
			petriNet.addArcFromTo(transition, exitingPlace);
			if (node.type.endsWith("parallelGateway") || node.type.endsWith("inclusiveGateway")) {
				let exitingObject = null;
				let enteringObject = null;
				if (sourceCount[node] > 1) {
					exitingObject = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
					petriNet.addArcFromTo(exitingPlace, exitingObject);
				}
				else {
					exitingObject = exitingPlace;
				}
				
				if (targetCount[node] > 1) {
					enteringObject = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
					petriNet.addArcFromTo(enteringObject, entryPlace);
				}
				else {
					enteringObject = entryPlace;
				}
				nodesEntering[node] = enteringObject;
				nodesExiting[node] = exitingObject;
			}
			else {
				nodesEntering[node] = entryPlace;
				nodesExiting[node] = exitingPlace;
			}
			
			if (node.type.toLowerCase().endsWith("startevent")) {
				let startTransition = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(sourcePlace, startTransition);
				petriNet.addArcFromTo(startTransition, entryPlace);
			}
			else if (node.type.toLowerCase().endsWith("endevent")) {
				let endTransition = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(exitingPlace, endTransition);
				petriNet.addArcFromTo(endTransition, sinkPlace);
			}
		}
		
		for (let flowId in bpmnGraph.edges) {
			let flow = bpmnGraph.edges[flowId];
			let sourceObject = nodesExiting[flow.source];
			let targetObject = nodesEntering[flow.target];
			if (sourceObject.constructor.name == "PetriNetPlace") {
				let inv1 = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(sourceObject, inv1);
				sourceObject = inv1;
			}
			if (targetObject.constructor.name == "PetriNetPlace") {
				let inv2 = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(inv2, targetObject);
				targetObject = inv2;
			}
			petriNet.addArcFromTo(sourceObject, flowPlace[flow]);
			petriNet.addArcFromTo(flowPlace[flow], targetObject);
		}
		
		// TODO: extra management of inclusiveGateways
		
		let acceptingPetriNet = new AcceptingPetriNet(petriNet, im, fm);
		PetriNetReduction.apply(acceptingPetriNet, false);
		
		Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net (converted from BPMN)");

		return acceptingPetriNet;
	}
}

try {
	require('../../../pm4js.js');
	require('../../bpmn/bpmn_graph.js');
	require('../../petri_net/petri_net.js');
	require('../../petri_net/util/reduction.js');
	module.exports = {BpmnToPetriNetConverter: BpmnToPetriNetConverter};
	global.BpmnToPetriNetConverter = BpmnToPetriNetConverter;
}
catch (err) {
	//console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("BpmnToPetriNetConverter", "apply", ["BpmnGraph"], "AcceptingPetriNet", "Convert BPMN graph to an Accepting Petri Net", "Alessandro Berti");


class WfNetToBpmnConverter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = WfNetToBpmnConverter.uuidv4();
		return "id"+uuid.replace(/-/g, "");
	}
	
	static apply(acceptingPetriNet) {
		let bpmnGraph = new BpmnGraph(WfNetToBpmnConverter.nodeUuid());
		let enteringDictio = {};
		let exitingDictio = {};
		for (let placeId in acceptingPetriNet.net.places) {
			let place = acceptingPetriNet.net.places[placeId];
			let node = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
			node.type = "exclusiveGateway";
			enteringDictio[place] = node;
			exitingDictio[place] = node;
		}
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			if (trans.label == null) {
				let node = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				if (Object.keys(trans.inArcs).length > 1 || Object.keys(trans.outArcs).length > 1) {
					node.type = "parallelGateway";
				}
				else {
					node.type = "exclusiveGateway";
				}
				enteringDictio[trans] = node;
				exitingDictio[trans] = node;
			}
			else {
				let enteringNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				let exitingNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				let task = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				
				if (Object.keys(trans.inArcs).length > 1) {
					enteringNode.type = "parallelGateway";
				}
				else {
					enteringNode.type = "exclusiveGateway";
				}
				
				if (Object.keys(trans.outArcs).length > 1) {
					exitingNode.type = "parallelGateway";
				}
				else {
					exitingNode.type = "exclusiveGateway";
				}
				
				task.type = "task";
				task.name = trans.label;
				
				let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
				edge.setSource(enteringNode);
				edge.setTarget(task);
				
				edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
				edge.setSource(task);
				edge.setTarget(exitingNode);
				
				enteringDictio[trans] = enteringNode;
				exitingDictio[trans] = exitingNode;
			}
		}
		for (let arcId in acceptingPetriNet.net.arcs) {
			let arc = acceptingPetriNet.net.arcs[arcId];
			let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
			edge.setSource(exitingDictio[arc.source]);
			edge.setTarget(enteringDictio[arc.target]);
		}
		
		let startNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
		let endNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
		startNode.type = "startEvent";
		endNode.type = "endEvent";
		for (let placeId in acceptingPetriNet.im.tokens) {
			let place = acceptingPetriNet.net.places[placeId];
			let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
			edge.setSource(startNode);
			edge.setTarget(enteringDictio[place]);
		}
		for (let placeId in acceptingPetriNet.fm.tokens) {
			let place = acceptingPetriNet.net.places[placeId];
			let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
			edge.setSource(exitingDictio[place]);
			edge.setTarget(endNode);
		}
		
		// reduction
		let changed = true;
		while (changed) {
			changed = false;
			let nodes = Object.keys(bpmnGraph.nodes);
			for (let nodeId of nodes) {
				let node = bpmnGraph.nodes[nodeId];
				if (node.type == "exclusiveGateway" && Object.keys(node.incoming).length == 1 && Object.keys(node.outgoing).length == 1) {
					let leftNode = bpmnGraph.edges[Object.keys(node.incoming)[0]].source;
					let rightNode = bpmnGraph.edges[Object.keys(node.outgoing)[0]].target;
					bpmnGraph.removeNode(node.id);
					let newEdge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
					newEdge.setSource(leftNode);
					newEdge.setTarget(rightNode);
					changed = true;
				}
			}
		}

		Pm4JS.registerObject(bpmnGraph, "BPMN graph (converted from accepting Petri net)");
		
		return bpmnGraph;
	}
}

try {
	require('../../../pm4js.js');
	require('../../petri_net/petri_net.js');
	require('../../bpmn/bpmn_graph.js');
	module.exports = {WfNetToBpmnConverter: WfNetToBpmnConverter};
	global.WfNetToBpmnConverter = WfNetToBpmnConverter;
}
catch (err) {
	//console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("WfNetToBpmnConverter", "apply", ["AcceptingPetriNet"], "BpmnGraph", "Convert WF-NET to BPMN graph", "Alessandro Berti");


class PtmlExporter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static apply(processTree) {
		let xmlDoc = document.createElement("ptml");
		let xmlProcessTree = document.createElementNS(PtmlExporter.DUMMY_SEP, "processTree");
		xmlDoc.appendChild(xmlProcessTree);
		let ptId = PtmlExporter.uuidv4();
		xmlProcessTree.setAttribute("id", ptId);
		xmlProcessTree.setAttribute("name", ptId);
		xmlProcessTree.setAttribute("root", processTree.id);
		let descendants = {};
		PtmlExporter.findAllDescendants(processTree, descendants);
		for (let treeId in descendants) {
			let tree = descendants[treeId];
			let label = "";
			let nodeType = "automaticTask";
			if (tree.label != null) {
				label = tree.label;
				nodeType = "manualTask";
			}
			if (tree.operator == ProcessTreeOperator.SEQUENCE) {
				nodeType = "sequence";
			}
			else if (tree.operator == ProcessTreeOperator.PARALLEL) {
				nodeType = "and";
			}
			else if (tree.operator == ProcessTreeOperator.INCLUSIVE) {
				nodeType = "or";
			}
			else if (tree.operator == ProcessTreeOperator.EXCLUSIVE) {
				nodeType = "xor";
			}
			else if (tree.operator == ProcessTreeOperator.LOOP) {
				nodeType = "xorLoop";
			}
			
			let xmlNode = document.createElementNS(PtmlExporter.DUMMY_SEP, nodeType);
			xmlNode.setAttribute("id", treeId);
			xmlNode.setAttribute("name", label);
			xmlProcessTree.appendChild(xmlNode);
		}

		for (let treeId in descendants) {
			let tree = descendants[treeId];

			if (tree.parentNode != null) {
				let xmlParentsNode = document.createElementNS(PtmlExporter.DUMMY_SEP, "parentsNode");
				xmlParentsNode.setAttribute("id", PtmlExporter.uuidv4());
				xmlParentsNode.setAttribute("sourceId", tree.parentNode.id);
				xmlParentsNode.setAttribute("targetId", tree.id);
				xmlProcessTree.appendChild(xmlParentsNode);
			}
			
		}
		
		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		
		let xmlStr = serializer.serializeToString(xmlDoc);
		xmlStr = xmlStr.replace(/AIOEWFRIUOERWQIO/g, "");

		return xmlStr;
	}

	static findAllDescendants(processTree, descendants) {
		descendants[processTree.id] = processTree;
		if (processTree.operator == ProcessTreeOperator.LOOP) {
			if (processTree.children.length < 3) {
				let thirdChild = new ProcessTree();
				thirdChild.parent = processTree;
				processTree.children.push(thirdChild);
			}
		}
		for (let child of processTree.children) {
			PtmlExporter.findAllDescendants(child, descendants);
		}
	}
}

// unlikely string, better look at other solutions ...
PtmlExporter.DUMMY_SEP = "AIOEWFRIUOERWQIO";

try {
	require('../../../pm4js.js');
	global.PtmlExporter = PtmlExporter;
	module.exports = {PtmlExporter: PtmlExporter};
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
}
catch (err) {
	// not in node
	//console.log(err);
}

Pm4JS.registerExporter("PtmlExporter", "apply", "ProcessTree", "ptml", "text/xml", "Process tree Exporter (.ptml)", "Alessandro Berti");


class FrequencyDfgExporter {
	static apply(frequencyDfg) {
		let ret = [];
		let activities = Object.keys(frequencyDfg.activities);
		ret.push(activities.length);
		for (let act in frequencyDfg.activities) {
			ret.push(act);
		}
		ret.push(Object.keys(frequencyDfg.startActivities).length);
		for (let act in frequencyDfg.startActivities) {
			ret.push(activities.indexOf(act)+"x"+frequencyDfg.startActivities[act]);
		}
		ret.push(Object.keys(frequencyDfg.endActivities).length);
		for (let act in frequencyDfg.endActivities) {
			ret.push(activities.indexOf(act)+"x"+frequencyDfg.endActivities[act]);
		}
		for (let path0 in frequencyDfg.pathsFrequency) {
			let path = path0.split(",");
			ret.push(activities.indexOf(path[0])+">"+activities.indexOf(path[1])+"x"+frequencyDfg.pathsFrequency[path0]);
		}
		return ret.join("\n");
	}
}

try {
	require('../../../pm4js.js');
	global.FrequencyDfgExporter = FrequencyDfgExporter;
	module.exports = {FrequencyDfgExporter: FrequencyDfgExporter};
}
catch (err) {
	// not in node
	//console.log(err);
}

Pm4JS.registerExporter("FrequencyDfgExporter", "apply", "FrequencyDfg", "dfg", "text/plain", "DFG Exporter (.dfg)", "Alessandro Berti");
Pm4JS.registerExporter("FrequencyDfgExporter", "apply", "PerformanceDfg", "dfg", "text/plain", "DFG Exporter (.dfg)", "Alessandro Berti");


class FrequencyDfgImporter {
	static apply(txtStri) {
		let stri = txtStri.split("\n");
		let i = 0;
		let numActivities = i + 1 + parseInt(stri[i]);
		i++;
		let activities = [];
		let activitiesIngoing = {};
		let startActivities = {};
		let endActivities = {};
		let pathsFrequency = {};
		while (i < numActivities) {
			activities.push(stri[i].trim());
			i++;
		}
		let numStartActivities = i + 1 + parseInt(stri[i]);
		i++;
		while (i < numStartActivities) {
			let stru = stri[i].trim().split("x");
			let act = activities[parseInt(stru[0])]
			startActivities[act] = parseInt(stru[1]);
			if (!(act in activitiesIngoing)) {
				activitiesIngoing[act] = 0;
			}
			activitiesIngoing[act] += parseInt(stru[1]);
			i++;
		}
		let numEndActivities = i + 1 + parseInt(stri[i]);
		i++;
		while (i < numEndActivities) {
			let stru = stri[i].trim().split("x");
			let act = activities[parseInt(stru[0])];
			endActivities[act] = parseInt(stru[1]);
			i++;
		}
		while (i < stri.length) {
			let stru = stri[i].trim();
			if (stru.length > 0) {
				let act1 = activities[parseInt(stru.split(">")[0])];
				let act2 = activities[parseInt(stru.split("x")[0].split(">")[1])];
				let count = parseInt(stru.split("x")[1]);
				if (!(act2 in activitiesIngoing)) {
					activitiesIngoing[act2] = 0;
				}
				activitiesIngoing[act2] += count;
				pathsFrequency[[act1, act2]] = count;
			}
			i++;
		}
		let ret = new FrequencyDfg(activitiesIngoing, startActivities, endActivities, pathsFrequency);
		Pm4JS.registerObject(ret, "Frequency DFG");
		return ret;
	}
}

try {
	require('../../../pm4js.js');
	global.FrequencyDfgImporter = FrequencyDfgImporter;
	module.exports = {FrequencyDfgImporter: FrequencyDfgImporter};
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerImporter("FrequencyDfgImporter", "apply", ["dfg"], "Frequency DFG Importer", "Alessandro Berti");


class PetriNetPlayout {
	static apply(acceptingPetriNet, numDesideredTraces=1000, activityKey="concept:name", timestampKey="time:timestamp") {
		let petriNet = acceptingPetriNet.net;
		let initialMarking = acceptingPetriNet.im;
		let finalMarking = acceptingPetriNet.fm;
		let count = 0;
		let minTimestamp = 10000000;
		let eventLog = new EventLog();
		while (true) {
			if (count >= numDesideredTraces) {
				break;
			}
			let trace = new Trace();
			let marking = initialMarking.copy();
			while (!(finalMarking.equals(marking))) {
				let enabledTransitions = marking.getEnabledTransitions();
				let pickedTransition = enabledTransitions[Math.floor(Math.random() * enabledTransitions.length)];
				if (pickedTransition.label != null) {
					let eve = new Event();
					eve.attributes[activityKey] = new Attribute(pickedTransition.label);
					eve.attributes[timestampKey] = new Attribute(new Date(minTimestamp*1000));
					trace.events.push(eve);
				}
				marking = marking.execute(pickedTransition);
				minTimestamp++;
			}
			eventLog.traces.push(trace);
			count++;
		}
		Pm4JS.registerObject(eventLog, "Simulated Event log (from Petri net)");
		return eventLog;
	}
}

try {
	require('../../../../pm4js.js');
	global.PetriNetPlayout = PetriNetPlayout;
	module.exports = {PetriNetPlayout: PetriNetPlayout};
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("PetriNetPlayout", "apply", ["AcceptingPetriNet"], "EventLog", "Perform Playout on a Petri net", "Alessandro Berti");


class ExponentialRandomVariable {
	constructor(lam) {
		this.lam = lam;
	}
	
	toString() {
		return "ExponentialRandomVariable lam="+this.lam;
	}
	
	static gen() {
		ExponentialRandomVariable.C = (ExponentialRandomVariable.C*ExponentialRandomVariable.G) % ExponentialRandomVariable.P;
		return ExponentialRandomVariable.C / ExponentialRandomVariable.P;
	}
	
	pdf(x) {
		if (x < 0) {
			throw "Exponential not defined for x < 0";
		}
		return this.lam * Math.exp(-this.lam * x);
	}
	
	cdf(x) {
		if (x < 0) {
			throw "Exponential not defined for x < 0";
		}
		return 1 - Math.exp(-this.lam * x);
	}
	
	getValue() {
		return (-1.0 / this.lam) * Math.log(1.0 - ExponentialRandomVariable.gen());
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	static estimateParameters(arrayValues) {
		let sum = 0.0;
		for (let v of arrayValues) {
			if (v < 0) {
				throw "Exponential not defined for x < 0";
			}
			sum += v;
		}
		return new ExponentialRandomVariable(1.0 / (sum / arrayValues.length));
	}
	
	getMean() {
		return 1.0 / this.lam;
	}
	
	getVariance() {
		return 1.0 / (this.lam * this.lam);
	}
	
	getMedian() {
		return Math.log(2) / this.lam;
	}
	
	getMode() {
		return 0;
	}
	
	getQuantile(p) {
		return - Math.log(1 - p) / this.lam;
	}
}

ExponentialRandomVariable.G = 536870911;
ExponentialRandomVariable.P = 2147483647;
ExponentialRandomVariable.C = 1;


try {
	require('../../pm4js.js');
	global.ExponentialRandomVariable = ExponentialRandomVariable;
	module.exports = {ExponentialRandomVariable: ExponentialRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}


class NormalRandomVariable {
	constructor(mu, sig) {
		this.mu = mu;
		this.sig = sig;
	}
	
	toString() {
		return "NormalRandomVariable mu="+this.mu+" sig="+this.sig;
	}
	
	static gen() {
		NormalRandomVariable.C = (NormalRandomVariable.C*NormalRandomVariable.G) % NormalRandomVariable.P;
		return NormalRandomVariable.C / NormalRandomVariable.P;
	}
	
	static erf(x) {
		let v = 1;
		v = v + 0.278393*x;
		let y = x * x;
		v = v + 0.230389*y;
		y = y * x;
		v = v + 0.000972*y;
		y = y * x;
		v = v + 0.078108*y;
		v = v * v;
		v = v * v;
		v = 1.0 / v;
		v = 1.0 - v;
		return v;
	}
	
	static erfinv(x) {
		let sgn = 1;
		if (x < 0) {
			sgn = -1;
			x = -x;
		}
		x = (1 - x)*(1 + x);
		let lnx = Math.log(x);
		let tt1 = 2/(Math.PI * 0.147) + 0.5 * lnx;
		let tt2 = 1/0.147 * lnx;
		return sgn * Math.sqrt(-tt1 + Math.sqrt(tt1 * tt1 - tt2));
	}
	
	pdf(x) {
		return 1.0/(this.sig*Math.sqrt(2*Math.PI)) * Math.exp(-0.5*((x-this.mu)/this.sig)*((x-this.mu)/this.sig));
	}
	
	cdf(x) {
		return 0.5*(1.0 + NormalRandomVariable.erf((x - this.mu)/(this.sig * Math.sqrt(2))));
	}
	
	getValue() {
		let v1 = NormalRandomVariable.gen();
		let v2 = NormalRandomVariable.gen();
		return this.mu + this.sig * Math.cos(2*Math.PI*v2) * Math.sqrt(-2.0 * Math.log(v1));
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	static estimateParameters(arrayValues) {
		let sum = 0.0;
		for (let v of arrayValues) {
			sum += v;
		}
		let avg = sum / arrayValues.length;
		sum = 0.0;
		for (let v of arrayValues) {
			sum += (v - avg) * (v-avg);
		}
		let std = Math.sqrt(sum / arrayValues.length);
		return new NormalRandomVariable(avg, std);
	}
	
	getMean() {
		return this.mu;
	}
	
	getVariance() {
		return this.sig * this.sig;
	}
	
	getMedian() {
		return this.mu;
	}
	
	getMode() {
		return this.mu;
	}
	
	getQuantile(p) {
		return this.mu + this.sig * Math.sqrt(2) * NormalRandomVariable.erfinv(2*p - 1);
	}
}

NormalRandomVariable.G = 536870911;
NormalRandomVariable.P = 2147483647;
NormalRandomVariable.C = 1;


try {
	require('../../pm4js.js');
	global.NormalRandomVariable = NormalRandomVariable;
	module.exports = {NormalRandomVariable: NormalRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}


class LogNormalRandomVariable {
	constructor(mu, sig) {
		this.mu = mu;
		this.sig = sig;
	}
	
	toString() {
		return "LogNormalRandomVariable mu="+this.mu+" sig="+this.sig;
	}
	
	static gen() {
		LogNormalRandomVariable.C = (LogNormalRandomVariable.C*LogNormalRandomVariable.G) % LogNormalRandomVariable.P;
		return LogNormalRandomVariable.C / LogNormalRandomVariable.P;
	}
	
	static erf(x) {
		let v = 1;
		v = v + 0.278393*x;
		let y = x * x;
		v = v + 0.230389*y;
		y = y * x;
		v = v + 0.000972*y;
		y = y * x;
		v = v + 0.078108*y;
		v = v * v;
		v = v * v;
		v = 1.0 / v;
		v = 1.0 - v;
		return v;
	}
	
	static erfinv(x) {
		let sgn = 1;
		if (x < 0) {
			sgn = -1;
			x = -x;
		}
		x = (1 - x)*(1 + x);
		let lnx = Math.log(x);
		let tt1 = 2/(Math.PI * 0.147) + 0.5 * lnx;
		let tt2 = 1/0.147 * lnx;
		return sgn * Math.sqrt(-tt1 + Math.sqrt(tt1 * tt1 - tt2));
	}
	
	pdf(x) {
		if (x < 0) {
			throw "Lognormal not defined for x < 0";
		}
		return 1.0 / (x * this.sig * Math.sqrt(2 * Math.PI)) * Math.exp(-(Math.log(x) - this.mu)*(Math.log(x) - this.mu)/(2 * this.sig * this.sig));
	}
	
	cdf(x) {
		if (x < 0) {
			throw "Lognormal not defined for x < 0";
		}
		return 0.5*(1.0 + LogNormalRandomVariable.erf((Math.log(x) - this.mu)/(this.sig * Math.sqrt(2))));
	}
	
	getValue() {
		let v1 = NormalRandomVariable.gen();
		let v2 = NormalRandomVariable.gen();
		return Math.exp(this.mu + this.sig * Math.cos(2*Math.PI*v2) * Math.sqrt(-2.0 * Math.log(v1)));
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	static estimateParameters(arrayValues) {
		let sum = 0.0;
		for (let v of arrayValues) {
			if (v < 0) {
				throw "Lognormal not defined for x < 0";
			}
			sum += v;
		}
		let avg = sum / arrayValues.length;
		sum = 0.0;
		for (let v of arrayValues) {
			sum += (v - avg) * (v-avg);
		}
		let std = Math.sqrt(sum / arrayValues.length);
		let mu = Math.log((avg * avg)/(Math.sqrt(avg*avg + std*std)));
		let s = Math.sqrt(Math.log(1 + (std*std)/(avg*avg)))
		return new LogNormalRandomVariable(mu, s);
	}
	
	getMean() {
		return Math.exp(this.mu + this.sig * this.sig / 2.0);
	}
	
	getVariance() {
		return (Math.exp(this.sig * this.sig) - 1) * Math.exp(2*this.mu + this.sig * this.sig);
	}
	
	getMedian() {
		return Math.exp(this.mu);
	}
	
	getMode() {
		return Math.exp(this.mu - this.sig * this.sig);
	}
	
	getQuantile(p) {
		return Math.exp(this.mu + Math.sqrt(2 * this.sig * this.sig) * LogNormalRandomVariable.erfinv(2 * p - 1));
	}
}

LogNormalRandomVariable.G = 536870911;
LogNormalRandomVariable.P = 2147483647;
LogNormalRandomVariable.C = 1;


try {
	require('../../pm4js.js');
	global.LogNormalRandomVariable = LogNormalRandomVariable;
	module.exports = {LogNormalRandomVariable: LogNormalRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}


class GammaRandomVariable {
	constructor(k, theta) {
		this.k = k;
		this.theta = theta;
	}
	
	toString() {
		return "GammaRandomVariable k="+this.k+" theta="+this.theta;
	}
	
	static gen() {
		GammaRandomVariable.C = (GammaRandomVariable.C*GammaRandomVariable.G) % GammaRandomVariable.P;
		return GammaRandomVariable.C / GammaRandomVariable.P;
	}
	
	static estimateParameters(arrayValues) {
		let n = arrayValues.length;
		let kn = 0;
		for (let v of arrayValues) {
			if (v < 0) {
				throw "Gamma not defined for x < 0";
			}
			kn += v;
		}
		kn = kn * n * (n-1);
		let kd1 = 0;
		let kd2 = 0;
		let kd3 = 0;
		for (let v of arrayValues) {
			kd1 += v * Math.log(v);
			kd2 += Math.log(v);
			kd3 += v;
		}
		kd1 = kd1 * n;
		let kd = (n+2)*(kd1 - kd2 * kd3);
		let k = kn / kd;
		let theta = kd / (n * n * (n-1));
		return new GammaRandomVariable(k, theta);
	}
	
	static eulerGamma(x) {
		x = x - 1;
		return Math.sqrt(Math.PI) * Math.pow(Math.abs(x) / Math.E, x) * Math.pow(8 * x * x *x + 4 *x *x + x + 1.0 / 3.0, 1.0 / 6.0);
	}
	
	pdf(x) {
		if (x < 0) {
			throw "Gamma not defined for x < 0";
		}
		return (Math.pow(x, this.k - 1) * Math.exp(-x / this.theta)) / (Math.pow(this.theta, this.k) * GammaRandomVariable.eulerGamma(this.k));
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	getMean() {
		return this.k * this.theta;
	}
	
	getVariance() {
		return this.k * this.theta * this.theta;
	}
	
	getMode() {
		if (this.k > 1) {
			return (this.k - 1)*this.theta;
		}
		return 0;
	}
	
	getValue() {
		let k = 0 + this.k;
		let exp = new ExponentialRandomVariable(1.0 / this.theta);
		let ret = 0;
		while (k > 1) {
			ret += exp.getValue();
			k = k - 1;
		}
		let umax = Math.pow((k / Math.E), k / 2.0);
		let vmin = -2 / Math.E;
		let vmax = 2*k / (Math.E * (Math.E - k));
		while (true) {
			let v1 = GammaRandomVariable.gen();
			let v2 = GammaRandomVariable.gen();
			let u = umax * v1;
			let v = (vmax - vmin) * v2 + vmin;
			let t = v / u;
			let x = Math.exp(t / k);
			if (2*Math.log(u) <= t - x) {
				ret += x * this.theta;
				break;
			}
		}
		return ret;
	}
}

GammaRandomVariable.G = 536870911;
GammaRandomVariable.P = 2147483647;
GammaRandomVariable.C = 1;

try {
	require('../../pm4js.js');
	global.GammaRandomVariable = GammaRandomVariable;
	module.exports = {GammaRandomVariable: GammaRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}


class ExponentiallyModifiedGaussian {
	constructor(mu, sig, lam) {
		this.mu = mu;
		this.sig = sig;
		this.lam = lam;
	}
	
	toString() {
		return "ExponentiallyModifiedGaussian mu="+this.mu+" sig="+this.sig+" lam="+this.lam;
	}
	
	static erf(x) {
		let v = 1;
		v = v + 0.278393*x;
		let y = x * x;
		v = v + 0.230389*y;
		y = y * x;
		v = v + 0.000972*y;
		y = y * x;
		v = v + 0.078108*y;
		v = v * v;
		v = v * v;
		v = 1.0 / v;
		v = 1.0 - v;
		return v;
	}
	
	static estimateParameters(arrayValues) {
		let n = arrayValues.length;
		let mu = 0.0;
		for (let v of arrayValues) {
			mu += v;
		}
		mu = mu / n;
		let std = 0.0;
		for (let v of arrayValues) {
			std += (v - mu) * (v - mu);
		}
		std = std / n;
		std = Math.sqrt(std);
		let skew = 0.0;
		for (let v of arrayValues) {
			skew += v * v * v;
		}
		skew = skew / n;
		skew = (skew - 3 * mu * std * std - mu * mu * mu) / (std * std * std);
		let muDist = mu - std * Math.pow(Math.abs(skew) / 2.0, 2.0 / 3.0);
		let stdDist = Math.sqrt(std * std * (1 - Math.pow((Math.abs(skew) / 2.0), 2.0 / 3.0)));
		let tauDist = std * Math.pow((Math.abs(skew) / 2), 1.0 / 3.0);
		return new ExponentiallyModifiedGaussian(muDist, stdDist, 1.0 / tauDist);
	}
	
	getMean() {
		return this.mu + 1.0 / this.lam;
	}
	
	getVariance() {
		return this.sig * this.sig + 1.0 / (this.lam * this.lam);
	}
	
	pdf(x) {
		return this.lam / 2.0 * Math.exp(this.lam / 2.0 * (2 * this.mu + this.lam * this.sig * this.sig - 2*x)) * (1 - ExponentiallyModifiedGaussian.erf((this.mu + this.lam * this.sig * this.sig - x)/(Math.sqrt(2) * this.sig)));
	}
	
	cdf(x) {
		let u = this.lam * (x - this.mu);
		let v = this.lam * this.sig;
		let rv1 = new NormalRandomVariable(0, v);
		let rv2 = new NormalRandomVariable(v*v, v);
		return rv1.cdf(u) - Math.exp(-(u + v*v)/(2 + Math.log(rv2.cdf(u))));
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	getValue() {
		let rv1 = new NormalRandomVariable(this.mu, this.sig);
		let rv2 = new ExponentialRandomVariable(this.lam);
		return rv1.getValue() + rv2.getValue();
	}
}

try {
	require('../../pm4js.js');
	global.ExponentiallyModifiedGaussian = ExponentiallyModifiedGaussian;
	module.exports = {ExponentiallyModifiedGaussian: ExponentiallyModifiedGaussian};
}
catch (err) {
	// not in Node
	//console.log(err);
}



class UniformRandomVariable {
	constructor(a, b) {
		if (a >= b) {
			throw "a must be lower than b";
		}
		this.a = a;
		this.b = b;
	}
	
	toString() {
		return "UniformRandomVariable a="+this.a+" b="+this.b;
	}
	
	pdf(x) {
		if (x >= this.a && x <= this.b) {
			return 1.0 / (this.b - this.a);
		}
		return 0.0;
	}
	
	cdf(x) {
		if (x <= this.a) {
			return 0.0;
		}
		else if (x > this.a && x < this.b) {
			return (x - this.a)/(this.b - this.a);
		}
		else {
			return 1.0;
		}
	}
	
	static estimateParameters(arrayValues) {
		let minValue = Number.MAX_VALUE;
		let maxValue = -Number.MAX_VALUE;
		for (let v of arrayValues) {
			if (v < minValue) {
				minValue = v;
			}
			if (v > maxValue) {
				maxValue = v;
			}
		}
		return new UniformRandomVariable(minValue, maxValue);
	}
	
	getMean() {
		return 0.5 * (this.a + this.b);
	}
	
	getMedian() {
		return 0.5 * (this.a + this.b);
	}
	
	getMode() {
		return 0.5 * (this.a + this.b);
	}
	
	getVariance() {
		return 1.0 / 12.0 * (this.b - this.a) * (this.b - this.a);
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	static gen() {
		UniformRandomVariable.C = (UniformRandomVariable.C*UniformRandomVariable.G) % UniformRandomVariable.P;
		return UniformRandomVariable.C / UniformRandomVariable.P;
	}
	
	getValue() {
		let val = UniformRandomVariable.gen();
		return this.a + (this.b - this.a) * val;
	}
	
	getQuantile(p) {
		return this.a + p * (this.b - this.a);
	}
}

UniformRandomVariable.G = 536870911;
UniformRandomVariable.P = 2147483647;
UniformRandomVariable.C = 1;

try {
	require('../../pm4js.js');
	global.UniformRandomVariable = UniformRandomVariable;
	module.exports = {UniformRandomVariable: UniformRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}



class RandomVariableFitter {
	static apply(arrayValues, debug=false) {
		let rv = null;
		let likelihood = -Number.MAX_VALUE;
		if (debug) {
			console.log("----- debug -----");
		}
		try {
			let un = UniformRandomVariable.estimateParameters(arrayValues);
			let unLikelihood = un.logLikelihood(arrayValues);
			if (debug) {
				console.log(un.toString() + " unLikelihood = "+unLikelihood);
			}
			if (unLikelihood > likelihood) {
				rv = un;
				likelihood = unLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let nv = NormalRandomVariable.estimateParameters(arrayValues);
			let nvLikelihood = nv.logLikelihood(arrayValues);
			if (debug) {
				console.log(nv.toString() + " nvLikelihood = "+nvLikelihood);
			}
			if (nvLikelihood > likelihood) {
				rv = nv;
				likelihood = nvLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let lnv = LogNormalRandomVariable.estimateParameters(arrayValues);
			let lnvLikelihood = lnv.logLikelihood(arrayValues);
			if (debug) {
				console.log(lnv.toString() + " lnvLikelihood = "+lnvLikelihood);
			}
			if (lnvLikelihood > likelihood) {
				rv = lnv;
				likelihood = lnvLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let ev = ExponentialRandomVariable.estimateParameters(arrayValues);
			let evLikelihood = ev.logLikelihood(arrayValues);
			if (debug) {
				console.log(ev.toString() + "evLikelihood = "+evLikelihood);
			}
			if (evLikelihood > likelihood) {
				rv = ev;
				likelihood = evLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let gv = GammaRandomVariable.estimateParameters(arrayValues);
			let gvLikelihood = gv.logLikelihood(arrayValues);
			if (debug) {
				console.log(gv.toString() + " gvLikelihood = "+gvLikelihood);
			}
			if (gvLikelihood > likelihood) {
				rv = gv;
				likelihood = gvLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let emn = ExponentiallyModifiedGaussian.estimateParameters(arrayValues);
			let emnLikelihood = emn.logLikelihood(arrayValues);
			if (debug) {
				console.log(emn.toString() + " emnLikelihood = "+emnLikelihood);
			}
			if (emnLikelihood > likelihood) {
				rv = emn;
				likelihood = emnLikelihood;
			}
		}
		catch (err) {
		}
		if (debug) {
			console.log("----- /debug -----");
		}
		return rv;
	}
}

try {
	require('../../pm4js.js');
	global.RandomVariableFitter = RandomVariableFitter;
	module.exports = {RandomVariableFitter: RandomVariableFitter};
}
catch (err) {
	// not in Node
	//console.log(err);
}



class PerformanceDfgSimulation {
	static choiceFromProbDct(dct) {
		let choices = [];
		let prob = [];
		let cumprob = 0.0;
		for (let k in dct) {
			choices.push(k);
			cumprob += dct[k];
			prob.push(cumprob);
		}
		let rr = Math.random();
		let i = 0;
		while (i < choices.length) {
			if (prob[i] > rr) {
				return choices[i];
			}
			i++;
		}
	}
	
	static apply(performanceDfg, numDesideredTraces=1000, activityKey="concept:name", timestampKey="time:timestamp", caseArrivalRate=1) {
		let artificialDfg = performanceDfg.getArtificialDfg();
		let outgoing = {};
		for (let path0 in artificialDfg[1]) {
			let path = path0.split(",");
			if (!(path[0] in outgoing)) {
				outgoing[path[0]] = {};
			}
			outgoing[path[0]][path[1]] = artificialDfg[1][path0] / artificialDfg[0][path[0]];
		}
		let eventLog = new EventLog();
		let timestamp = 10000000;
		let i = 0;
		while (i < numDesideredTraces) {
			timestamp += 1;
			let currTraceTimestampTrace = 0 + timestamp;
			let trace = new Trace();
			eventLog.traces.push(trace);
			let currActivity = "▶";
			while (currActivity != "■") {
				let nextActivity = PerformanceDfgSimulation.choiceFromProbDct(outgoing[currActivity]);
				if (currActivity != "▶" && nextActivity != "■") {
					let path = [currActivity, nextActivity];
					let pathPerformance = performanceDfg.pathsPerformance[path];
					if (pathPerformance > 0) {
						let exp = new ExponentialRandomVariable(1.0 / pathPerformance);
						currTraceTimestampTrace += exp.getValue();
					}
				}
				if (nextActivity != "■") {
					let eve = new Event();
					eve.attributes[activityKey] = new Attribute(nextActivity);
					eve.attributes[timestampKey] = new Attribute(new Date(currTraceTimestampTrace*1000));
					trace.events.push(eve);
				}
				currActivity = nextActivity;
			}
			i++;
		}
		Pm4JS.registerObject(eventLog, "Simulated Event log (performance simulation from DFG)");
		return eventLog;
	}
}

try {
	require("../../../../pm4js.js");
	module.exports = {PerformanceDfgSimulation: PerformanceDfgSimulation};
	global.PerformanceDfgSimulation = PerformanceDfgSimulation;
}
catch (err) {
	// not in Node
}

Pm4JS.registerAlgorithm("PerformanceDfgSimulation", "apply", ["PerformanceDfg"], "EventLog", "Perform Playout on a Performance DFG (performance simulation)", "Alessandro Berti");


class JsonOcelImporter {
	static apply(jsonString) {
		return JsonOcelImporter.importLog(jsonString);
	}
	
	static importLog(jsonString) {
		let ret = JSON.parse(jsonString);
		for (let evId in ret["ocel:events"]) {
			ret["ocel:events"][evId]["ocel:timestamp"] = new Date(ret["ocel:events"][evId]["ocel:timestamp"]);
		}
		return ret;
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {JsonOcelImporter: JsonOcelImporter};
	global.JsonOcelImporter = JsonOcelImporter;
}
catch (err) {
	// not in node
	//console.log(err);
}


class XmlOcelImporter {
	static apply(xmlString) {
		return XmlOcelImporter.importLog(xmlString);
	}
	
	static importLog(xmlString) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlLog = xmlDoc.getElementsByTagName("log")[0];
		let ocel = {};
		XmlOcelImporter.parseXmlObj(xmlLog, ocel);
		return ocel;
	}
	
	static parseXmlObj(xmlObj, target) {
		for (let childId in xmlObj.childNodes) {
			let child = xmlObj.childNodes[childId];
			if (child.tagName == "event") {
				let eveId = null;
				let eveActivity = null;
				let eveTimestamp = null;
				let eveOmap = [];
				let eveVmap = {};
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						if (child2.getAttribute("key") == "id") {
							eveId = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "activity") {
							eveActivity = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "timestamp") {
							eveTimestamp = new Date(child2.getAttribute("value"));
						}
						else if (child2.getAttribute("key") == "omap") {
							for (let childId3 in child2.childNodes) {
								let child3 = child2.childNodes[childId3];
								if (child3.tagName != null) {
									eveOmap.push(child3.getAttribute("value"));
								}
							}
						}
						else if (child2.getAttribute("key") == "vmap") {
							for (let childId3 in child2.childNodes) {
								let child3 = child2.childNodes[childId3];
								if (child3.tagName != null) {
									XmlOcelImporter.parseAttribute(child3, eveVmap);
								}
							}
						}
					}
				}
				target[eveId] = {"ocel:activity": eveActivity, "ocel:timestamp": eveTimestamp, "ocel:omap": eveOmap, "ocel:vmap": eveVmap};
			}
			else if (child.tagName == "object") {
				let objId = null;
				let objType = null;
				let objOvmap = {};
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						if (child2.getAttribute("key") == "id") {
							objId = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "type") {
							objType = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "ovmap") {
							for (let childId3 in child2.childNodes) {
								let child3 = child2.childNodes[childId3];
								if (child3.tagName != null) {
									XmlOcelImporter.parseAttribute(child3, objOvmap);
								}
							}
						}
					}
				}
				target[objId] = {"ocel:type": objType, "ocel:ovmap": objOvmap};
			}
			else if (child.tagName == "events") {
				target["ocel:events"] = {};
				XmlOcelImporter.parseXmlObj(child, target["ocel:events"]);
			}
			else if (child.tagName == "objects") {
				target["ocel:objects"] = {};
				XmlOcelImporter.parseXmlObj(child, target["ocel:objects"]);
			}
			else if (child.tagName == "global") {
				if (child.getAttribute("scope") == "event") {
					target["ocel:global-event"] = {};
					for (let childId2 in child.childNodes) {
						let child2 = child.childNodes[childId2];
						if (child2.tagName != null) {
							XmlOcelImporter.parseAttribute(child2, target["ocel:global-event"]);
						}
					}
				}
				else if (child.getAttribute("scope") == "object") {
					target["ocel:global-object"] = {};
					for (let childId2 in child.childNodes) {
						let child2 = child.childNodes[childId2];
						if (child2.tagName != null) {
							XmlOcelImporter.parseAttribute(child2, target["ocel:global-object"]);
						}
					}
				}
				else if (child.getAttribute("scope") == "log") {
					target["ocel:global-log"] = {"ocel:attribute-names": [], "ocel:object-types": []};
					for (let childId2 in child.childNodes) {
						let child2 = child.childNodes[childId2];
						if (child2.tagName != null) {
							if (child2.getAttribute("key") == "attribute-names") {
								for (let childId3 in child2.childNodes) {
									let child3 = child2.childNodes[childId3];
									if (child3.tagName != null) {
										target["ocel:global-log"]["ocel:attribute-names"].push(child3.getAttribute("value"));
									}
								}
							}
							else if (child2.getAttribute("key") == "object-types") {
								for (let childId3 in child2.childNodes) {
									let child3 = child2.childNodes[childId3];
									if (child3.tagName != null) {
										target["ocel:global-log"]["ocel:object-types"].push(child3.getAttribute("value"));
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	static parseAttribute(xmlObj, target) {
		let attName = xmlObj.getAttribute("key");
		let attValue = xmlObj.getAttribute("value");
		if (xmlObj.tagName == "string") {
			target[attName] = attValue;
		}
		else if (xmlObj.tagName == "date") {
			target[attName] = attValue;
		}
		else {
			target[attName] = ""+attValue;
		}
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {XmlOcelImporter: XmlOcelImporter};
	global.XmlOcelImporter = XmlOcelImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in node
	//console.log(err);
}


class JsonOcelExporter {
	static apply(ocel) {
		return JsonOcelExporter.exportLog(ocel);
	}
	
	static exportLog(ocel) {
		return JSON.stringify(ocel);
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {JsonOcelExporter: JsonOcelExporter};
	global.JsonOcelExporter = JsonOcelExporter;
}
catch (err) {
	// not in node
	//console.log(err);
}



class XmlOcelExporter {
	static apply(ocel) {
		return XmlOcelExporter.exportLog(ocel);
	}
	
	static exportLog(ocel) {
		let xmlDocument = document.createElement("log");
		let globalLog = document.createElement("global");
		globalLog.setAttribute("scope", "log");
		let globalObject = document.createElement("global");
		globalObject.setAttribute("scope", "object");
		let globalEvent = document.createElement("global");
		globalEvent.setAttribute("scope", "event");
		let events = document.createElement("events");
		let objects = document.createElement("objects");
		xmlDocument.appendChild(globalLog);
		xmlDocument.appendChild(globalObject);
		xmlDocument.appendChild(globalEvent);
		xmlDocument.appendChild(events);
		xmlDocument.appendChild(objects);
		
		XmlOcelExporter.exportGlobalLog(ocel, globalLog);
		XmlOcelExporter.exportGlobalObject(ocel, globalObject);
		XmlOcelExporter.exportGlobalEvent(ocel, globalEvent);
		XmlOcelExporter.exportEvents(ocel, events);
		XmlOcelExporter.exportObjects(ocel, objects);

		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		const xmlStr = serializer.serializeToString(xmlDocument);
		return xmlStr;
	}
	
	static exportEvents(ocel, xmlEvents) {
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let xmlEvent = document.createElement("event");
			xmlEvents.appendChild(xmlEvent);
			let eveId = document.createElement("string");
			eveId.setAttribute("key", "id");
			eveId.setAttribute("value", evId);
			xmlEvent.appendChild(eveId);
			let eveActivity = document.createElement("string");
			eveActivity.setAttribute("key", "activity");
			eveActivity.setAttribute("value", eve["ocel:activity"]);
			xmlEvent.appendChild(eveActivity);
			let eveTimestamp = document.createElement("date");
			eveTimestamp.setAttribute("key", "timestamp");
			eveTimestamp.setAttribute("value", eve["ocel:timestamp"]);
			xmlEvent.appendChild(eveTimestamp);
			let xmlOmap = document.createElement("list");
			xmlOmap.setAttribute("key", "omap");
			xmlEvent.appendChild(xmlOmap);
			for (let relObj of eve["ocel:omap"]) {
				let xmlObj = document.createElement("string");
				xmlObj.setAttribute("key", "object-id");
				xmlObj.setAttribute("value", relObj);
				xmlOmap.appendChild(xmlObj);
			}
			let xmlVmap = document.createElement("list");
			xmlVmap.setAttribute("key", "vmap");
			xmlEvent.appendChild(xmlVmap);
			for (let att in eve["ocel:vmap"]) {
				XmlOcelExporter.exportAttribute(att, eve["ocel:vmap"][att], xmlEvent);
			}
		}
	}
	
	static exportObjects(ocel, xmlObjects) {
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			let xmlObj = document.createElement("object");
			xmlObjects.appendChild(xmlObj);
			let xmlObjId = document.createElement("string");
			xmlObjId.setAttribute("key", "id");
			xmlObjId.setAttribute("value", objId);
			xmlObj.appendChild(xmlObjId);
			let xmlObjType = document.createElement("string");
			xmlObjType.setAttribute("key", "type")
			xmlObjType.setAttribute("value", obj["ocel:type"]);
			xmlObj.appendChild(xmlObjType);
			let xmlObjOvmap = document.createElement("list");
			xmlObjOvmap.setAttribute("key", "ovmap");
			xmlObj.appendChild(xmlObjOvmap);
			for (let att in obj["ocel:ovmap"]) {
				XmlOcelExporter.exportAttribute(att, obj["ocel:ovmap"][att], xmlObj);
			}
		}
	}
	
	static exportGlobalLog(ocel, globalLog) {
		let attributeNames = document.createElement("list");
		globalLog.appendChild(attributeNames);
		attributeNames.setAttribute("key", "attribute-names");
		let objectTypes = document.createElement("list");
		globalLog.appendChild(objectTypes);
		objectTypes.setAttribute("key", "object-types");
		for (let att of ocel["ocel:global-log"]["ocel:attribute-names"]) {
			let xmlAttr = document.createElement("string");
			xmlAttr.setAttribute("key", "attribute-name");
			xmlAttr.setAttribute("value", att);
			attributeNames.appendChild(xmlAttr);
		}
		for (let ot of ocel["ocel:global-log"]["ocel:object-types"]) {
			let xmlOt = document.createElement("string");
			xmlOt.setAttribute("key", "object-type");
			xmlOt.setAttribute("value", ot);
			objectTypes.appendChild(xmlOt);
		}
	}
	
	static exportGlobalEvent(ocel, globalEvent) {
		for (let att in ocel["ocel:global-event"]) {
			XmlOcelExporter.exportAttribute(att, ocel["ocel:global-event"][att], globalEvent);
		}
	}
	
	static exportGlobalObject(ocel, globalObject) {
		for (let att in ocel["ocel:global-object"]) {
			XmlOcelExporter.exportAttribute(att, ocel["ocel:global-object"][att], globalObject);
		}
	}
	
	static exportAttribute(attName, attValue, parentObj) {
		let xmlTag = null;
		let value = null;
			if (typeof attValue == "string") {
				xmlTag = "string";
				value = attValue;
			}
			else if (typeof attValue == "object") {
				xmlTag = "date";
				console.log(attValue);
				value = attValue.toISOString();
			}
			else if (typeof attValue == "number") {
				xmlTag = "float";
				value = ""+attValue;
			}
			
			if (value != null) {
				let thisAttribute = document.createElement(xmlTag);
				thisAttribute.setAttribute("key", attName);
				thisAttribute.setAttribute("value", value);
				parentObj.appendChild(thisAttribute);
			}
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {XmlOcelExporter: XmlOcelExporter};
	global.XmlOcelExporter = XmlOcelExporter;
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
}
catch (err) {
	// not in node
	//console.log(err);
}


class OcelFlattening {
	static apply(ocel, objType, caseIdKey="concept:name", activityKey="concept:name", timestampKey="time:timestamp") {
		return OcelFlattening.flatten(ocel, objType, caseIdKey, activityKey, timestampKey);
	}
	
	static flatten(ocel, objType, caseIdKey="concept:name", activityKey="concept:name", timestampKey="time:timestamp") {
		let log = new EventLog();
		let objTraces = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			for (let objId of eve["ocel:omap"]) {
				let obj = ocel["ocel:objects"][objId];
				if (obj["ocel:type"] == objType) {
					let trace = null;
					if (!(objId in objTraces)) {
						trace = new Trace();
						trace.attributes[caseIdKey] = new Attribute(objId);
						log.traces.push(trace);
						objTraces[objId] = trace;
					}
					else {
						trace = objTraces[objId];
					}
					let xesEve = new Event();
					trace.events.push(xesEve);
					xesEve.attributes[activityKey] = new Attribute(eve["ocel:activity"]);
					xesEve.attributes[timestampKey] = new Attribute(new Date(eve["ocel:timestamp"]));
					for (let attr in eve["ocel:vmap"]) {
						xesEve.attributes[attr] = new Attribute(eve["ocel:vmap"][attr]);
					}
				}
			}
		}
		return log;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelFlattening: OcelFlattening};
	global.OcelFlattening = OcelFlattening;
}
catch (err) {
	// not in node
	//console.log(err);
}


class OcelToCelonis {
	static escap(stru, sep, quotechar) {
		if (stru.indexOf(sep) > -1) {
			return quotechar + stru + quotechar;
		}
		else {
			return stru;
		}
	}
	
	static getLogFromCollection(coll, logName, logType, objType1, objType2, sep, quotechar, newline) {
		if (!(logName in coll)) {
			coll[logName] = [];
			if (logType == "events") {
				coll[logName].push("EVID_"+objType1+sep+"CASE_"+objType1+sep+"ACT_"+objType1+sep+"TIME_"+objType1+sep+"EVID_GENERAL");
			}
			else if (logType == "objects") {
				coll[logName].push("CASE_"+objType1);
			}
			else if (logType == "objrel") {
				coll[logName].push("CASE_"+objType1+sep+"CASE_"+objType2);
			}
			else if (logType == "everel") {
				coll[logName].push("SOURCE_EVID_"+objType1+sep+"TARGET_EVID_"+objType2);
			}
		}
		return coll[logName];
	}
	
	static pushElementIntoCollection(coll, elem, logName, logType, objType1, objType2, sep, quotechar, newline) {
		let log = OcelToCelonis.getLogFromCollection(coll, logName, logType, objType1, objType2, sep, quotechar, newline);
		let i = 0;
		while (i < elem.length) {
			elem[i] = OcelToCelonis.escap(elem[i], sep, quotechar);
			i++;
		}
		elem = elem.join(sep);
		if (!(log.includes(elem))) {
			log.push(elem);
		}
	}
	
	static yaml1(objectTypes, transitions) {
		let ret = [];
		ret.push("eventLogsMetadata:");
		ret.push("    eventLogs:");
		for (let ot of objectTypes) {
			ret.push("      - id: "+ot);
			ret.push("        displayName: "+ot);
			ret.push("        pql: '\""+ot+"_EVENTS\".\"ACT_"+ot+"\"'")
		}
		ret.push("    transitions:");
		for (let trans of transitions) {
			ret.push("      - id: "+trans[0]+"_"+trans[1]);
			ret.push("        displayName: "+trans[0]+"_"+trans[1]);
			ret.push("        firstEventLogId: "+trans[0]);
			ret.push("        secondEventLogId: "+trans[1]);
			ret.push("        type: INTERLEAVED");
		}
		return ret.join("\n");
	}
	
	static yaml2(objectTypes, transitions) {
		let ret = [];
		ret.push("settings:");
		ret.push("    eventLogs:");
		for (let ot of objectTypes) {
			ret.push("      - eventLog: "+ot);
		}
		return ret.join("\n");
	}
	
	static apply(ocel, sep=",", quotechar="\"", newline="\r\n") {
		let coll = {};
		let objectTypes = {};
		let transitions0 = {};
		let timestampColumns = {};
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			for (let objId of eve["ocel:omap"]) {
				let objType = ocel["ocel:objects"][objId]["ocel:type"];
				OcelToCelonis.pushElementIntoCollection(coll, [objId], objType+"_CASES", "objects", objType, null, sep, quotechar, newline);
				OcelToCelonis.pushElementIntoCollection(coll, [evId+":"+objId, objId, eve["ocel:activity"], DateUtils.formatDateString(eve["ocel:timestamp"]), evId], objType+"_EVENTS", "events", objType, null, sep, quotechar, newline);
				timestampColumns[objType+"_EVENTS"] = "TIME_"+objType;
				objectTypes[objType] = 0;
				for (let objId2 of eve["ocel:omap"]) {
					if (objId != objId2) {
						let objType2 = ocel["ocel:objects"][objId2]["ocel:type"];
						if (objType <= objType2) {
							if (objType < objType2) {
								OcelToCelonis.pushElementIntoCollection(coll, [objId, objId2], "CONNECT_"+objType+"_CASES_"+objType2+"_CASES", "objrel", objType, objType2, sep, quotechar, newline);
								transitions0[objType+"@#@#"+objType2] = 0;

							}
							OcelToCelonis.pushElementIntoCollection(coll, [evId+":"+objId, evId+":"+objId2],  "CONNECT_"+objType+"_EVENTS_"+objType2+"_EVENTS", "everel", objType, objType2, sep, quotechar, newline);
						}
					}
				}
			}
		}
		for (let logName in coll) {
			coll[logName] = coll[logName].join(newline);
		}
		objectTypes = Object.keys(objectTypes);
		let transitions = [];
		for (let trans0 in transitions0) {
			let trans00 = trans0.split("@#@#");
			transitions.push([trans00[0], trans00[1]]);
		}
		return {"coll": coll, "objectTypes": objectTypes, "transitions": transitions, "knowledgeYaml": OcelToCelonis.yaml1(objectTypes, transitions), "modelYaml": OcelToCelonis.yaml2(objectTypes, transitions), "timestampColumns": timestampColumns};
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelToCelonis: OcelToCelonis};
	global.OcelToCelonis = OcelToCelonis;
}
catch (err) {
	// not in node
	//console.log(err);
}


class CelonisMapper {
	constructor(baseUrl, apiKey) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.dataPools = null;
		this.dataPoolsNames = null;
		this.dataModels = null;
		this.dataModelsNames = null;
		this.dataPoolsDataModels = null;
		this.dataModelsDataPools = null;
		this.dataModelsTables = null;
		this.analysis = null;
		this.analysisNames = null;
		this.analysisDataModel = null;
		this.getDataPools();
		this.getDataModels();
		this.getAnalyses();
		this.defaultAnalysis = null;
		console.log("initialized mapper ("+this.baseUrl+")");
	}
	
	getFirstAnalysis() {
		if (this.defaultAnalysis != null) {
			return this.defaultAnalysis;
		}
		let analysisIds = Object.keys(this.analysis).sort();
		return analysisIds[0];
	}
	
	getDataPools() {
		this.dataPools = null;
		this.dataPoolsNames = null;
		this.dataPools = {};
		this.dataPoolsNames = {};
		let resp = this.performGet(this.baseUrl+"/integration/api/pools");
		for (let obj of resp) {
			this.dataPoolsNames[obj["name"]] = obj["id"];
			this.dataPools[obj["id"]] = obj;
		}
	}
	
	getDataModels() {
		this.dataModels = null;
		this.dataPoolsDataModels = null;
		this.dataModelsDataPools = null;
		this.dataModelsNames = null;
		this.dataModelsTables = null;
		this.dataModels = {};
		this.dataPoolsDataModels = {};
		this.dataModelsDataPools = {};
		this.dataModelsNames = {};
		this.dataModelsTables = {};
		for (let objId in this.dataPools) {
			this.dataPoolsDataModels[objId] = {};
			let resp = this.performGet(this.baseUrl+"/integration/api/pools/"+objId+"/data-models");
			for (let model of resp) {
				this.dataPoolsDataModels[objId][model["id"]] = model;
				this.dataModels[model["id"]] = model;
				this.dataModelsDataPools[model["id"]] = objId;
				this.dataModelsNames[model["name"]] = model["id"];
				this.dataModelsTables[model["id"]] = {};
				for (let table of model.tables) {
					this.dataModelsTables[model["id"]][table["id"]] = table["name"];
				}
			}
		}
	}
	
	getAnalyses() {
		this.analysis = null;
		this.analysisNames = null;
		this.analysis = {};
		this.analysisNames = {};
		let resp = this.performGet(this.baseUrl+"/process-mining/api/analysis");
		for (let ana of resp) {
			this.analysis[ana["id"]] = ana;
			this.analysisNames[ana["name"]] = ana["id"];
		}
		this.getAnalysesDataModel();
	}
	
	getAnalysesDataModel() {
		this.analysisDataModel = null;
		this.analysisDataModel = {};
		for (let anaId in this.analysis) {
			let resp = this.performGet(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+anaId+"/data_model");
			this.analysisDataModel[anaId] = resp["id"];
		}
	}
	
	pausecomp(millis)
	{
		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < millis);
	}
	
	performQueryAnalysis(analysisId, pqlQuery, waitingTime1=250, waitingTime2=750) {
		let dataModel = this.dataModels[this.analysisDataModel[analysisId]];
		let payload = {'dataCommandRequest': {'variables': [], 'request': {'commands': [{'queries': [pqlQuery], 'computationId': 0, 'isTransient': false}], 'cubeId': dataModel["id"]}}, 'exportType': 'CSV'};
		let resp1 = this.performPostJson(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+analysisId+"/exporting/query", payload);
		if (resp1["exportStatus"] == "WAITING" || resp1["exportStatus"] == "RUNNING" || resp1["exportStatus"] == "DONE") {
			let downloadId = resp1["id"];
			while (true) {
				this.pausecomp(waitingTime1);
				let resp2 = this.performGet(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+analysisId+"/exporting/query/"+downloadId+"/status");
				if (resp2.exportStatus == "DONE" || resp2.exportStatus == "SUCCESS" || resp2.exportStatus == "ERROR") {
					break;
				}
				this.pausecomp(waitingTime2);
			}
			let resp3 = this.performGet(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+analysisId+"/exporting/query/"+downloadId+"/download", false);
			return resp3;
		}
		return resp1;
	}
	
	pushCSV(dataPoolId, csvContent, tableName, reload=true, timestampColumn=null, sep=",", quotechar="\"", newline="\r\n", waitingTime1=750, waitingTime2=250) {
		let url = this.baseUrl+ "/integration/api/v1/data-push/"+dataPoolId+"/jobs/";
		let payload = {"targetName": tableName, "dataPoolId": dataPoolId, "fileType": "CSV"};
		let columnsConfig = [];
		let header = csvContent.substring(0, csvContent.indexOf(newline)).split(sep);
		for (let col of header) {
			if (col == timestampColumn) {
				columnsConfig.push({"columnName": col, "columnType": "DATETIME"});
			}
			else {
				columnsConfig.push({"columnName": col, "columnType": "STRING"});
			}
		}
		let csvParsingOptions = {};
		csvParsingOptions["decimalSeparator"] = ".";
		csvParsingOptions["separatorSequence"] = ",";
		csvParsingOptions["lineEnding"] = "\\r";
		csvParsingOptions["dateFormat"] = "yyyy-mm-ddThh:mm:ss";
		payload["tableSchema"] = {"tableName": tableName, "columns": columnsConfig};
		//payload["csvParsingOptions"] = csvParsingOptions;
		let dataPushID = this.performPostJson(url, payload)["id"];
		let targetUrl = this.baseUrl+ "/integration/api/v1/data-push/"+dataPoolId+"/jobs/"+dataPushID+"/chunks/upserted";
		payload = {"key": "file", "fileName": "prova.csv", "files": csvContent};
		payload["tableSchema"] = {"tableName": tableName, "columns": columnsConfig};
		//payload["csvParsingOptions"] = csvParsingOptions;
		console.log("... uploading the table: "+tableName);
		try {
			this.performPostJsonAlwaysProxified(targetUrl, payload);
		}
		catch (err) {
			//console.log(err);
		}
		targetUrl = this.baseUrl+ "/integration/api/v1/data-push/"+dataPoolId+"/jobs/"+dataPushID;
		try {
			this.performPostJson(targetUrl, {});
		}
		catch (err) {
			//console.log(err);
		}
		while (true) {
			this.pausecomp(waitingTime1);
			let ret = this.performGet(targetUrl);
			if (ret.status == "DONE" || ret.status == "SUCCESS" || ret.status == "ERROR") {
				break;
			}
			console.log("... still queued ("+ret.status+")");
			this.pausecomp(waitingTime2);
		}
		console.log("... finished upload of the table: "+tableName);
		if (reload) {
			this.getDataPools();
		}
	}
	
	createWorkspace(dataModelId, name) {
		let ret = this.performPostJson(this.baseUrl+"/process-mining/api/processes", {"name": name, "dataModelId": dataModelId});
		return ret["id"];
	}
	
	createAnalysis(workspaceId, name, reload=true) {
		let ret = this.performPostJson(this.baseUrl+"/process-mining/api/analysis", {"name": name, "processId": workspaceId, "applicationId": null});
		if (reload) {
			this.getAnalyses();
		}
		return ret["id"];
	}
	
	createDataModel(dataPoolId, name, reload=true) {
		let ret = this.performPostJson(this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models", {"name": name, "poolId": dataPoolId, "configurationSkipped": true});
		if (reload) {
			this.getDataModels();
		}
		return ret["id"];
	}
	
	createDataPool(name, reload=true) {
		let ret = this.performPostJson(this.baseUrl+"/integration/api/pools", {"name": name});
		if (reload) {
			this.getDataPools();
		}
		return ret["id"];
	}
	
	getTablesFromPool(dataPoolId) {
		let ret = this.performGet(this.baseUrl+"/integration/api/pools/"+dataPoolId+"/tables");
		return ret;
	}
	
	addTableFromPool(dataModelId, tableName, reload=true) {
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		let payload = [{"dataSourceId": null, "dataModelId": dataModelId, "name": tableName, "alias": tableName}];
		let ret = this.performPostJson(this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-model/"+dataModelId+"/tables", payload);
		if (reload) {
			this.getDataModels();
		}
	}
	
	getTableIdFromName(dataModelId, tableName) {
		for (let tableId in this.dataModelsTables[dataModelId]) {
			if (this.dataModelsTables[dataModelId][tableId] == tableName) {
				return tableId;
			}
		}
	}
	
	addForeignKey(dataModelId, table1, column1, table2, column2, reload=true) {
		table1 = this.getTableIdFromName(dataModelId, table1);
		table2 = this.getTableIdFromName(dataModelId, table2);
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/foreign-keys";
		let payload = {"dataModelId": dataModelId, "sourceTableId": table1, "targetTableId": table2, "columns": [{"sourceColumnName": column1, "targetColumnName": column2}]};
		let ret = this.performPostJson(url, payload);
		if (reload) {
			this.getDataModels();
		}
	}
	
	addProcessConfiguration(dataModelId, activityTable, caseTable, caseIdColumn, activityColumn, timestampColumn, sortingColumn=null, reload=true) {
		let payload = {};
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		activityTable = this.getTableIdFromName(dataModelId, activityTable);
		caseTable = this.getTableIdFromName(dataModelId, caseTable);
		payload["activityTableId"] = activityTable;
		if (caseTable != null) {
			payload["caseTableId"] = caseTable;
		}
		payload["caseIdColumn"] = caseIdColumn;
		payload["activityColumn"] = activityColumn;
		payload["timestampColumn"] = timestampColumn;
		if (sortingColumn != null) {
			payload["sortingColumn"] = sortingColumn;
		}
		let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/process-configurations";
		let ret = this.performPutJson(url, payload);
		if (reload) {
			this.getDataModels();
		}
	}
	
	reloadDataModel(dataModelId, waitingTime1=1000, waitingTime2=10000) {
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		let dataModel = this.dataModels[dataModelId];
		let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/reload";
		try {
			let ret = this.performPostJson(url, {"forceComplete": true});
		}
		catch (err) {
		}
		console.log("... reloading the data model: "+dataModel["name"]);
		while (true) {
			let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/load-history/load-info-sync";
			this.pausecomp(waitingTime1);
			let ret = this.performGet(url)["loadInfo"]["currentComputeLoad"]["loadStatus"];
			if (ret == "DONE" || ret == "SUCCESS" || ret == "ERROR" || ret == "WARNING") {
				break;
			}
			console.log("... still waiting  ("+ret+")");
			this.pausecomp(waitingTime2);
		}
		console.log("successful reload of data model: "+dataModel["name"]);
	}
	
	performGet(url, isRequestJson=true) {
		if (CelonisMapper.IS_NODE) {
			let ret = retus(url, {headers: {"authorization": "Bearer "+this.apiKey}}).body;
			if (isRequestJson) {
				return JSON.parse(ret);
			}
			return ret;
		}
		else {
			let ret = null;
			let ajaxDict = {
				url: CelonisMapper.PROXY_URL_GET,
				data: {"access_token": this.apiKey, "url": url},
				async: false,
				success: function(data) {
					ret = data;
				}
			}
			$.ajax(ajaxDict);
			if (isRequestJson) {
				ret = JSON.parse(ret);
			}
			return ret;
		}
	}
	
	performPostJson(url, jsonContent) {
		if (CelonisMapper.IS_NODE) {
			return retus(url, {method: "post", headers: {"authorization": "Bearer "+this.apiKey}, json: jsonContent}).body;
		}
		else {
			let ret = null;
			if (Array.isArray(jsonContent)) {
				jsonContent = {"@@content": jsonContent};
			}
			jsonContent["access_token"] = this.apiKey;
			jsonContent["url"] = url;
			let ajaxDict = {
				url: CelonisMapper.PROXY_URL_POST,
				dataType: 'json',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify(jsonContent),
				async: false,
				success: function(data) {
					ret = data;
				}
			}
			$.ajax(ajaxDict);
			return ret;
		}
	}
	
	performPostJsonAlwaysProxified(url, jsonContent) {
		jsonContent["access_token"] = this.apiKey;
		jsonContent["url"] = url;
		if (CelonisMapper.IS_NODE) {
			return retus(CelonisMapper.PROXY_URL_POST, {method: "post", headers: {"authorization": "Bearer "+this.apiKey}, json: jsonContent}).body;
		}
		else {
			let ret = null;
			let ajaxDict = {
				url: CelonisMapper.PROXY_URL_POST,
				dataType: 'json',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify(jsonContent),
				async: false,
				success: function(data) {
					ret = data;
				}
			}
			$.ajax(ajaxDict);
			return ret;
		}
	}
	
	performPutJson(url, jsonContent) {
		if (CelonisMapper.IS_NODE) {
			return retus(url, {method: "put", headers: {"authorization": "Bearer "+this.apiKey}, json: jsonContent}).body;
		}
		else {
			let ret = null;
			jsonContent["access_token"] = this.apiKey;
			jsonContent["url"] = url;
			let ajaxDict = {
				url: CelonisMapper.PROXY_URL_PUT,
				dataType: 'json',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify(jsonContent),
				async: false,
				success: function(data) {
					ret = data;
				}
			}
			$.ajax(ajaxDict);
			return ret;
		}
	}
	
	static autoConfiguration() {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		let targetUrl = ""+document.referrer;
		targetUrl = targetUrl.substring(0, targetUrl.length - 1);
		let apiKey = urlParams.get("key");
		let analysis = urlParams.get("analysis");
		let celonisMapper = new CelonisMapper(targetUrl, apiKey);
		celonisMapper.defaultAnalysis = analysis;
		return celonisMapper;
	}
	
	toString() {
		return "CelonisMapper url="+this.baseUrl+" key="+this.apiKey+" defaultAnalysis="+this.defaultAnalysis;
	}
}

CelonisMapper.PROXY_URL_GET = "http://localhost:5004/getWrapper";
CelonisMapper.PROXY_URL_POST = "http://localhost:5004/postWrapper";
CelonisMapper.PROXY_URL_PUT = "http://localhost:5004/putWrapper";
try {
	global.retus = require("retus");
	require('../../pm4js.js');
	global.CelonisMapper = CelonisMapper;
	module.exports = {CelonisMapper: CelonisMapper};
	CelonisMapper.IS_NODE = true;
}
catch (err) {
	// not in Node
	CelonisMapper.IS_NODE = false;
}

class Celonis1DWrapper {
	constructor(celonisMapper) {
		this.celonisMapper = celonisMapper;
	}
	
	getProcessConfiguration(dataModel, processConfigurationId=null) {
		if (processConfigurationId == null) {
			let ret = dataModel.processConfigurations[0];
			return ret;
		}
		else {
			let i = 0;
			while (i < dataModel.processConfigurations.length) {
				if (dataModel.processConfigurations[i].id == processConfigurationId) {
					return dataModel.processConfigurations[i];
				}
				i++;
			}
		}
	}
	
	downloadBaseEventLog(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\" AS \"case:concept:name\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"concept:name\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" AS \"time:timestamp\") NOLIMIT;");
		query = query.join("");
		return CsvImporter.apply(this.celonisMapper.performQueryAnalysis(analysisId, query));
	}
	
	downloadStartActivities(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LAG ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"PREV_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\",");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"COUNT\") NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let sa_dict = {};
		for (let el of ret) {
			if (el[0].length == 0) {
				sa_dict[el[1]] = parseInt(el[2]);
			}
		}
		return sa_dict;
	}
	
	downloadEndActivities(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LEAD ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"NEXT_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\",");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"COUNT\") NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let ea_dict = {};
		for (let el of ret) {
			if (el[0].length == 0) {
				ea_dict[el[1]] = parseInt(el[2]);
			}
		}
		return ea_dict;
	}
	
	downloadActivities(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\", ");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"ACTIVITY\") NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let activities = {};
		let i = 1;
		while (i < ret.length) {
			activities[ret[i][0]] = parseInt(ret[i][1]);
			i++;
		}
		return activities;
	}
	
	downloadPathsFrequency(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LEAD ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"NEXT_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\", ");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"COUNT\") NOLIMIT;")
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let i = 1;
		let pathsFrequency = {};
		while (i < ret.length) {
			if (ret[i][0].length > 0) {
				pathsFrequency[[ret[i][1], ret[i][0]]] = parseInt(ret[i][2]);
			}
			i++;
		}
		return pathsFrequency;
	}
	
	downloadVariants(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("VARIANT(\""+activityTable+"\".\""+processConfiguration.activityColumn+"\")");
		query.push(", COUNT(VARIANT(\""+activityTable+"\".\""+processConfiguration.activityColumn+"\"))");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let variants = {};
		let i = 1;
		while (i < ret.length) {
			variants[ret[i][0]] = parseInt(ret[i][1]);
			i++;
		}
		return variants;
	}
	
	downloadPathsPerformance(analysisId, processConfigurationId=null, relationship="ANY_OCCURRENCE [ ] TO ANY_OCCURRENCE [ ]") {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("SOURCE ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", "+relationship+" ), ");
		query.push("TARGET ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\" ), ");
		query.push("AVG ( SECONDS_BETWEEN ( SOURCE ( \""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" ) , TARGET ( \""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" ) ) )");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let pathsPerformance = {};
		let i = 1;
		while (i < ret.length) {
			pathsPerformance[[ret[i][0], ret[i][1]]] = parseFloat(ret[i][2]);
			i++;
		}
		return pathsPerformance;
	}
	
	downloadSojournTimes(analysisId, processConfigurationId=null, timestampColumn=null, startTimestampColumn=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		if (timestampColumn == null) {
			timestampColumn = processConfiguration.timestampColumn;
		}
		if (startTimestampColumn == null) {
			startTimestampColumn = processConfiguration.timestampColumn;
		}
		timestampColumn = "\""+activityTable+"\".\""+timestampColumn+"\"";
		startTimestampColumn = "\""+activityTable+"\".\""+startTimestampColumn+"\"";
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\", ");
		query.push("AVG(SECONDS_BETWEEN("+startTimestampColumn+", "+timestampColumn+")) ");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let sojournTime = {};
		let i = 1;
		while (i < ret.length) {
			sojournTime[ret[i][0]] = parseFloat(ret[i][1]);
			i++;
		}
		return sojournTime;
	}
	
	downloadAllCaseDurations(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\", ");
		query.push("MAX ( CALC_THROUGHPUT ( CASE_START TO CASE_END, REMAP_TIMESTAMPS ( \""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" , SECONDS ) ) )");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let caseDurations = [];
		let i = 1;
		while (i < ret.length) {
			if (ret[i][1].length > 0) {
				caseDurations.push(parseFloat(ret[i][1]));
			}
			else {
				caseDurations.push(0);
			}
			i++;
		}
		return caseDurations;
	}
	
	downloadFrequencyDfg(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let activities = this.downloadActivities(analysisId, processConfigurationId);
		let startActivities = this.downloadStartActivities(analysisId, processConfigurationId);
		let endActivities = this.downloadEndActivities(analysisId, processConfigurationId);
		let pathsFrequency = this.downloadPathsFrequency(analysisId, processConfigurationId);
		return new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency);
	}
	
	downloadPerformanceDfg(analysisId, processConfigurationId=null, timestampColumn=null, startTimestampColumn=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let activities = this.downloadActivities(analysisId, processConfigurationId);
		let startActivities = this.downloadStartActivities(analysisId, processConfigurationId);
		let endActivities = this.downloadEndActivities(analysisId, processConfigurationId);
		let pathsFrequency = this.downloadPathsFrequency(analysisId, processConfigurationId);
		let pathsPerformance = this.downloadPathsPerformance(analysisId, processConfigurationId);
		let sojournTimes = this.downloadSojournTimes(analysisId, processConfigurationId);
		return new PerformanceDfg(activities, startActivities, endActivities, pathsFrequency, pathsPerformance, sojournTimes);
	}
	
	uploadEventLogToCelonis(eventLog, baseName, dummy=false, caseIdKey="concept:name", activityKey="concept:name", timestampKey="time:timestamp", sep=",", quotechar="\"", newline="\r\n", casePrefix="case:") {
		let dataPoolId = null;
		let dataModelId = null;
		let workspaceId = null;
		let analysisId = null;
		let cases = {};
		for (let trace of eventLog.traces) {
			let caseId = trace.attributes[caseIdKey].value;
			if (caseId.indexOf(sep) > -1) {
				caseId = quotechar+caseId+quotechar;
			}
			cases[caseId] = 0;
		}
		cases = Object.keys(cases);
		caseIdKey = casePrefix+caseIdKey;
		cases.unshift(caseIdKey);
		cases = cases.join(newline);
		let csvExport = CsvExporter.apply(eventLog, sep, quotechar, casePrefix, newline);
		if (!(dummy)) {
			dataPoolId = this.celonisMapper.createDataPool(baseName+"_POOL", false);
			this.celonisMapper.getDataPools();
			dataModelId = this.celonisMapper.createDataModel(dataPoolId, baseName+"_DMODEL");
			this.celonisMapper.getDataModels();
			console.log("created data pool");
			this.celonisMapper.pushCSV(dataPoolId, csvExport, baseName+"_ACTIVITIES", false, "time:timestamp", sep, quotechar, newline);
			this.celonisMapper.getDataPools();
			console.log("created activity table");
			this.celonisMapper.addTableFromPool(dataModelId, baseName+"_ACTIVITIES", false);
			console.log("created data model for activities");
			this.celonisMapper.pushCSV(dataPoolId, cases, baseName+"_CASES", false, null, sep, quotechar, newline);
			this.celonisMapper.getDataPools();
			console.log("created cases table");
			this.celonisMapper.addTableFromPool(dataModelId, baseName+"_CASES", false);
			console.log("created data model for cases");
			this.celonisMapper.getDataModels();
			this.celonisMapper.addForeignKey(dataModelId, baseName+"_ACTIVITIES", caseIdKey, baseName+"_CASES", caseIdKey, false);
			console.log("added foreign key");
			this.celonisMapper.addProcessConfiguration(dataModelId, baseName+"_ACTIVITIES", baseName+"_CASES", caseIdKey, activityKey, timestampKey, null, false);
			console.log("added process configuration");
			this.celonisMapper.reloadDataModel(dataModelId);
			console.log("reloaded data model");
			workspaceId = this.celonisMapper.createWorkspace(dataModelId, baseName+"_WORKSPACE");
			console.log("created workspace");
			analysisId = this.celonisMapper.createAnalysis(workspaceId, baseName+"_ANALYSIS", false);
			console.log("created analysis");
			this.celonisMapper.getDataPools();
			console.log("reloading data pools");
			this.celonisMapper.getDataModels();
			console.log("reloading data models");
			this.celonisMapper.getAnalyses();
			console.log("reloading analyses");
		}
		return {"dataPoolId": dataPoolId, "dataModelId": dataModelId, "workspaceId": workspaceId, "analysisId": analysisId};
	}
}

try {
	require('../../pm4js.js');
	global.Celonis1DWrapper = Celonis1DWrapper;
	module.exports = {Celonis1DWrapper: Celonis1DWrapper};
}
catch (err) {
	// not in Node
}


class CelonisNDWrapper {
	constructor(celonisMapper) {
		this.celonisMapper = celonisMapper;
		this.celonis1Dwrapper = new Celonis1DWrapper(this.celonisMapper);
	}
	
	getMVPmodel(analysisId) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let mvp = {};
		for (let configuration of dataModel.processConfigurations) {
			let activityTable = dataModelTables[configuration["activityTableId"]];
			mvp[activityTable] = this.celonis1Dwrapper.downloadFrequencyDfg(analysisId, configuration.id);
		}
		return mvp;
	}
	
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = CelonisNDWrapper.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static stringToColour(str) {
	  var hash = 0;
	  for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	  }
	  var colour = '#';
	  for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		colour += ('00' + value.toString(16)).substr(-2);
	  }
	  return colour;
	}
	
	static visualizationMVP(mvp) {
		let ret = [];
		let activities = {};
		let startNodes = {};
		let endNodes = {};
		ret.push("digraph G {");
		for (let persp in mvp) {
			let perspCol = CelonisNDWrapper.stringToColour(persp);
			for (let act in mvp[persp].activities) {
				if (!(act in activities)) {
					let nodeUuid = CelonisNDWrapper.nodeUuid();
					activities[act] = nodeUuid;
					ret.push(nodeUuid+" [shape=box, label=\""+act+"\"]");
				}
			}
			let startNodeUuid = CelonisNDWrapper.nodeUuid();
			startNodes[persp] = startNodeUuid;
			ret.push(startNodeUuid+" [shape=ellipse, label=\""+persp+"\", color=\""+perspCol+"\", style=filled, fillcolor=\""+perspCol+"\"]");
			let endNodeUuid = CelonisNDWrapper.nodeUuid();
			endNodes[persp] = endNodeUuid;
			ret.push(endNodeUuid+" [shape=ellipse, label=\""+persp+"\", color=\""+perspCol+"\", style=filled, fillcolor=\""+perspCol+"\"]");
		}

		for (let persp in mvp) {
			let perspCol = CelonisNDWrapper.stringToColour(persp);
			for (let edge0 in mvp[persp].pathsFrequency) {
				let edge = edge0.split(",");
				ret.push(activities[edge[0]]+" -> "+activities[edge[1]]+" [color=\""+perspCol+"\", label=\"TO="+mvp[persp].pathsFrequency[edge0]+"\"]")
			}
			for (let act in mvp[persp].startActivities) {
				ret.push(startNodes[persp]+" -> "+activities[act]+" [color=\""+perspCol+"\", label=\"TO="+mvp[persp].startActivities[act]+"\"]");
			}
			for (let act in mvp[persp].endActivities) {
				ret.push(activities[act]+" -> "+endNodes[persp]+" [color=\""+perspCol+"\", label=\"TO="+mvp[persp].endActivities[act]+"\"]");
			}
		}
		ret.push("}");
		return ret.join("\n");
	}
	
	downloadBaseEventLog(analysisId, processConfiguration) {
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\" AS \"ocel:omap\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"ocel:activity\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" AS \"ocel:timestamp\") NOLIMIT;");
		query = query.join("");
		let res = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		return [activityTable, res];
	}

	downloadRelations(analysisId, processConfiguration1, processConfiguration2) {
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let activityTable1 = dataModelTables[processConfiguration1["activityTableId"]];
		let activityTable2 = dataModelTables[processConfiguration2["activityTableId"]];
		let activityColumn1 = processConfiguration1["activityColumn"];
		let activityColumn2 = processConfiguration2["activityColumn"];
		let timestampColumn1 = processConfiguration1["timestampColumn"];
		let timestampColumn2 = processConfiguration2["timestampColumn"];
		let caseColumn2 = processConfiguration2["caseIdColumn"];
		let query = [];
		query.push("TABLE (");
		query.push("TRANSIT_COLUMN ( TIMESTAMP_INTERLEAVED_MINER (");
		query.push("\""+activityTable2+"\".\""+activityColumn2+"\", ");
		query.push("\""+activityTable1+"\".\""+activityColumn1+"\"), ");
		query.push("\""+activityTable2+"\".\""+caseColumn2+"\"), ");
		query.push("\""+activityTable1+"\".\""+activityColumn1+"\", ");
		query.push("\""+activityTable1+"\".\""+timestampColumn1+"\"");
		query.push(") NOLIMIT;");
		query = query.join("");
		try {
			let res0 = this.celonisMapper.performQueryAnalysis(analysisId, query);
			return CsvImporter.parseCSV(res0);
		}
		catch (err) {
			console.log(err);
			return [];
		}
	}

	downloadDataModelFromCelonis(analysisId) {
		let dataModelId = this.celonisMapper.analysisDataModel[analysisId];
		let dataModel = this.celonisMapper.dataModels[dataModelId];
		let ocel = {"ocel:global-log": {"ocel:attribute-names": [], "ocel:object-types": []}, "ocel:events": {}, "ocel:objects": {}};
		for (let conf of dataModel.processConfigurations) {
			let arr = this.downloadBaseEventLog(analysisId, conf);
			let ot = arr[0];
			let log = arr[1];
			ocel["ocel:global-log"]["ocel:object-types"].push(ot);
			let i = 1;
			while (i < log.length) {
				let evid = log[i][1] + log[i][2];
				let objId = log[i][0];
				let eve = {"ocel:activity": log[i][1], "ocel:timestamp": new Date(log[i][2])};
				ocel["ocel:events"][evid] = {"ocel:activity": log[i][1], "ocel:timestamp": new Date(log[i][2]), "ocel:omap": {objId: 0}};
				if (!(objId in ocel["ocel:objects"])) {
					ocel["ocel:objects"][objId] = {"ocel:type": ot};
				}
				i++;
			}
		}
		let i = 0;
		while (i < dataModel.processConfigurations.length) {
			let j = 0;
			while (j < dataModel.processConfigurations.length) {
				if (i != j) {
					let ret = this.downloadRelations(analysisId, dataModel.processConfigurations[i], dataModel.processConfigurations[j]);
					let z = 1;
					while (z < ret.length) {
						let evid = ret[z][1] + ret[z][2];
						let objId = ret[z][0];
						ocel["ocel:events"][evid]["ocel:omap"][objId] = 0;
						z = z + 1;
					}
				}
				j++;
			}
			i++;
		}
		for (let evId in ocel["ocel:events"]) {
			if ("objId" in ocel["ocel:events"][evId]["ocel:omap"]) {
				delete ocel["ocel:events"][evId]["ocel:omap"]["objId"];
			}
			ocel["ocel:events"][evId]["ocel:omap"] = Object.keys(ocel["ocel:events"][evId]["ocel:omap"]);
		}
		return ocel;
	}
	
	uploadOcelToCelonis(ocel, baseName, dummy=false, sep=",", quotechar="\"", newline="\r\n") {
		let dataPoolId = null;
		let dataModelId = null;
		let workspaceId = null;
		let analysisId = null;
		let res = OcelToCelonis.apply(ocel, sep, quotechar, newline);
		if (!(dummy)) {
			dataPoolId = this.celonisMapper.createDataPool(baseName+"_POOL", false);
			dataModelId = this.celonisMapper.createDataModel(dataPoolId, baseName+"_DMODEL");
			this.celonisMapper.getDataPools();
			this.celonisMapper.getDataModels();
			for (let tab in res["coll"]) {
				console.log("pushing table: "+tab+" "+res["timestampColumns"][tab]);
				this.celonisMapper.pushCSV(dataPoolId, res["coll"][tab], tab, false, res["timestampColumns"][tab], sep, quotechar, newline);
				this.celonisMapper.getDataPools();
				console.log("adding table to data model: "+tab);
				this.celonisMapper.addTableFromPool(dataModelId, tab, false);
			}
			this.celonisMapper.getDataModels();
			for (let ot of res["objectTypes"]) {
				console.log("setting up foreign key for type: "+ot);
				this.celonisMapper.addForeignKey(dataModelId, ot+"_EVENTS", "CASE_"+ot, ot+"_CASES", "CASE_"+ot, false);
				console.log("adding process configuration:");
				this.celonisMapper.addProcessConfiguration(dataModelId, ot+"_EVENTS", ot+"_CASES", "CASE_"+ot, "ACT_"+ot, "TIME_"+ot, null, false);
			}
			for (let trans of res["transitions"]) {
				console.log("adding foreign keys for transition: "+trans);
				this.celonisMapper.addForeignKey(dataModelId, "CONNECT_"+trans[0]+"_CASES_"+trans[1]+"_CASES", "CASE_"+trans[0], trans[0]+"_CASES", "CASE_"+trans[0], false);
				this.celonisMapper.addForeignKey(dataModelId, "CONNECT_"+trans[0]+"_CASES_"+trans[1]+"_CASES", "CASE_"+trans[1], trans[1]+"_CASES", "CASE_"+trans[1], false);
			}
			this.celonisMapper.reloadDataModel(dataModelId);
			console.log("creating workspace");
			workspaceId = this.celonisMapper.createWorkspace(dataModelId, baseName+"_WORKSPACE");
			console.log("creating analysis");
			analysisId = this.celonisMapper.createAnalysis(workspaceId, baseName+"_ANALYSIS", false);
			console.log("reloading data pools");
			this.celonisMapper.getDataPools();
			console.log("reloading data models");
			this.celonisMapper.getDataModels();
			console.log("reloading analyses");
			this.celonisMapper.getAnalyses();
		}
		return {"dataPoolId": dataPoolId, "dataModelId": dataModelId, "workspaceId": workspaceId, "analysisId": analysisId, "objectTypes": res["objectTypes"], "transitions": res["transitions"], "knowledgeYaml": res["knowledgeYaml"], "modelYaml": res["modelYaml"]};
	}
}

try {
	require('../../pm4js.js');
	global.CelonisNDWrapper = CelonisNDWrapper;
	module.exports = {CelonisNDWrapper: CelonisNDWrapper};
}
catch (err) {
	// not in Node
}


class AlignmentsDfgGraphvizVisualizer {
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
	
	static apply(frequencyDfg, alignedTraces) {
		let smCount = {};
		let mmCount = {};
		let lmCount = {};
		for (let act in frequencyDfg.activities) {
			smCount[act] = 0;
			mmCount[act] = 0;
			lmCount[act] = 0;
		}
		for (let move0 in alignedTraces.movesUsage) {
			let move = move0.split(";");
			move[0] = move[0].substring(1, move[0].length);
			move[1] = move[1].substring(0, move[1].length-1);
			if (move[0] == move[1]) {
				// sync
				smCount[move[0]] = alignedTraces.movesUsage[move0];
			}
			else if (move[1] == ">>") {
				lmCount[move[0]] = alignedTraces.movesUsage[move0];
			}
			else if (move[0] == ">>") {
				mmCount[move[1]] = alignedTraces.movesUsage[move0];
			}
		}
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		for (let act in frequencyDfg.activities) {
			let nUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
			uidMap[act] = nUid;
			ret.push(nUid+" [shape=box, label=\""+act+"\nSM="+smCount[act]+";MM="+mmCount[act]+";LM="+lmCount[act]+"\"]");
		}
		let startNodeUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
		let endNodeUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
		ret.push(startNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=green]");
		ret.push(endNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=orange]");
		for (let sa in frequencyDfg.startActivities) {
			let occ = frequencyDfg.startActivities[sa];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(startNodeUid+" -> "+uidMap[sa]+" [penwidth=\""+penwidth+"\"]");
		}
		for (let ea in frequencyDfg.endActivities) {
			let occ = frequencyDfg.endActivities[ea];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(uidMap[ea]+" -> "+endNodeUid+" [penwidth=\""+penwidth+"\"]");
		}
		for (let arc in frequencyDfg.pathsFrequency) {
			let act1 = arc.split(",")[0];
			let act2 = arc.split(",")[1];
			let occ = frequencyDfg.pathsFrequency[arc];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(uidMap[act1]+" -> "+uidMap[act2]+" [penwidth=\""+penwidth+"\"]");
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	require('../../objects/dfg/frequency/obj.js');
	module.exports = {AlignmentsDfgGraphvizVisualizer: AlignmentsDfgGraphvizVisualizer};
	global.AlignmentsDfgGraphvizVisualizer = AlignmentsDfgGraphvizVisualizer;
}
catch (err) {
	// not in node
}

class TemporalProfile {
	constructor(temporalProfile) {
		this.temporalProfile = temporalProfile;
	}
}

class TemporalProfileDiscovery {
	static getAvg(vect) {
		if (vect.length > 0) {
			let sum = 0.0;
			for (let el of vect) {
				sum += el;
			}
			return sum / vect.length;
		}
		return 0;
	}
	
	static getStdev(vect, avg) {
		if (vect.length > 0) {
			let sum = 0.0;
			for (let el of vect) {
				sum += (el - avg)*(el - avg);
			}
			return Math.sqrt(sum / vect.length);
		}
		return 0;
	}
	
	static apply(eventLog, activityKey="concept:name", timestampKey="time:timestamp", startTimestampKey="time:timestamp", addObject=false) {
		let actCouplesTimes = {};
		let temporalProfile = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length - 1) {
				let act_i = trace.events[i].attributes[activityKey].value;
				let j = i + 1;
				while (j < trace.events.length) {
					let act_j = trace.events[j].attributes[activityKey].value;
					let ts1 = trace.events[i].attributes[timestampKey].value;
					let ts2 = trace.events[j].attributes[startTimestampKey].value;
					let diff = 0;
					if (BusinessHours.ENABLED) {
						diff = BusinessHours.apply(ts1, ts2);
					}
					else {
						ts1 = ts1.getTime();
						ts2 = ts2.getTime();
						diff = (ts2 - ts1)/1000;
					}
					if (!([act_i, act_j] in actCouplesTimes)) {
						actCouplesTimes[[act_i, act_j]] = [];
					}
					actCouplesTimes[[act_i, act_j]].push(diff);
					j++;
				}
				i++;
			}
		}
		for (let cou in actCouplesTimes) {
			let vect = actCouplesTimes[cou]
			let avg = TemporalProfileDiscovery.getAvg(vect);
			let stdev = TemporalProfileDiscovery.getStdev(vect, avg);
			temporalProfile[cou] = [avg, stdev];
		}
		return new TemporalProfile(temporalProfile);
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {TemporalProfileDiscovery: TemporalProfileDiscovery};
	global.TemporalProfileDiscovery = TemporalProfileDiscovery;
}
catch (err) {
	// not in Node.JS
}

class TemporalProfileConformanceResults {
	constructor(results) {
		this.results = results;
	}
}

class TemporalProfileConformance {
	static getAnalysis(eventLog, temporalProfile, activityKey="concept:name", timestampKey="time:timestamp", startTimestampKey="time:timestamp") {
		let confResults = [];
		for (let trace of eventLog.traces) {
			confResults.push([])
			let i = 0;
			while (i < trace.events.length - 1) {
				let act_i = trace.events[i].attributes[activityKey].value;
				let j = i + 1;
				while (j < trace.events.length) {
					let act_j = trace.events[j].attributes[activityKey].value;
					let ts1 = trace.events[i].attributes[timestampKey].value;
					let ts2 = trace.events[j].attributes[startTimestampKey].value;
					let diff = 0;
					if (BusinessHours.ENABLED) {
						diff = BusinessHours.apply(ts1, ts2);
					}
					else {
						ts1 = ts1.getTime();
						ts2 = ts2.getTime();
						diff = (ts2 - ts1)/1000;
					}
					let cou = [act_i, act_j];
					if (cou in temporalProfile.temporalProfile) {
						let avg = temporalProfile.temporalProfile[cou][0];
						let stdev = temporalProfile.temporalProfile[cou][1] + 0.0000001;
						let k = Math.abs(avg - diff) / stdev;
						confResults[confResults.length - 1].push([act_i, act_j, diff, k]);
					}
					j++;
				}
				i++;
			}
		}
		return confResults;
	}
	
	static apply(eventLog, temporalProfile, zeta, activityKey="concept:name", timestampKey="time:timestamp", startTimestampKey="time:timestamp", addObject=false) {
		let analysis = TemporalProfileConformance.getAnalysis(eventLog, temporalProfile, activityKey, timestampKey, startTimestampKey);
		let result = [];
		for (let trace of analysis) {
			result.push([]);
			for (let cou of trace) {
				if (cou[cou.length - 1] > zeta) {
					result[result.length - 1].push(cou);
				}
			}
		}
		return new TemporalProfileConformanceResults(result);
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {TemporalProfileConformance: TemporalProfileConformance};
	global.TemporalProfileConformance = TemporalProfileConformance;
}
catch (err) {
	// not in Node.JS
}


class OcelGraphs {
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(evId);
			}
		}
		return lif;
	}
	
	static eventsRelationGraph(ocel) {
		let lif = OcelGraphs.getObjectsLifecycle(ocel);
		let eveRelGraph = {};
		for (let evId in ocel["ocel:events"]) {
			eveRelGraph[evId] = {};
		}
		for (let objId in lif) {
			let objLif = lif[objId];
			let i = 0;
			while (i < objLif.length - 1) {
				let j = i + 1;
				while (j < objLif.length) {
					eveRelGraph[objLif[i]][objLif[j]] = 0;
					eveRelGraph[objLif[j]][objLif[i]] = 0;
					j++;
				}
				i++;
			}
		}
		return eveRelGraph;
	}
	
	static objectInteractionGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events);
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				for (let objId2 of eve["ocel:omap"]) {
					if (objId != objId2) {
						ret[[objId, objId2]] = 0;
					}
				}
			}
		}
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
	}
	
	static objectDescendantsGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events);
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (objId in seenObjects) {
					for (let objId2 of eve["ocel:omap"]) {
						if (!(objId2 in seenObjects)) {
							ret[[objId, objId2]] = 0;
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					seenObjects[objId] = 0;
				}
			}
		}
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
	}
	
	static objectCobirthGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events);
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					for (let objId2 of eve["ocel:omap"]) {
						if (!(objId2 in seenObjects)) {
							if (objId != objId2) {
								ret[[objId, objId2]] = 0;
							}
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					seenObjects[objId] = 0;
				}
			}
		}
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
	}
	
	static objectCodeathGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events).reverse();
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					for (let objId2 of eve["ocel:omap"]) {
						if (!(objId2 in seenObjects)) {
							if (objId != objId2) {
								ret[[objId, objId2]] = 0;
							}
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					seenObjects[objId] = 0;
				}
			}
		}
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
	}
	
	static objectInheritanceGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events).reverse();
		let lastEventLifecycle = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in lastEventLifecycle)) {
					lastEventLifecycle[objId] = evId;
				}
			}
		}
		evIds = evIds.reverse();
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (objId in lastEventLifecycle && lastEventLifecycle[objId] == evId) {
					for (let objId2 of eve["ocel:omap"]) {
						if (objId != objId2) {
							if (!(objId2 in seenObjects)) {
								ret[[objId, objId2]] = 0;
							}
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				seenObjects[objId] = 0;
			}
		}
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
	}
	
	static transformArrayToDictArray(arr) {
		let dl = {};
		let i = 0;
		while (i < arr.length) {
			let spli = arr[i].split(",");
			if (!(spli[0] in dl)) {
				dl[spli[0]] = [];
			}
			dl[spli[0]].push(spli[1]);
			i++;
		}
		return dl;
	}
	
	static expandGraph(graph0) {
		let graph = {};
		for (let k in graph0) {
			graph[k] = {};
			for (let k2 of graph0[k]) {
				graph[k][k2] = 0;
			}
		}
		let toVisit = {};
		let invGraph = {};
		for (let k in graph) {
			if (!(k in invGraph)) {
				invGraph[k] = [];
			}
			for (let k2 in graph[k]) {
				if (!(k2 in invGraph)) {
					invGraph[k2] = {};
				}
				invGraph[k2][k] = 0;
			}
		}
		for (let k in graph) {
			toVisit[k] = 0;
		}
		while (true) {
			let newToVisit = {};
			for (let k2 in toVisit) {
				for (let k in invGraph[k2]) {
					let newGraph = Object.assign({}, graph[k]);
					for (let k3 in graph[k2]) {
						newGraph[k3] = 0;
					}
					if (Object.keys(newGraph).length > Object.keys(graph[k]).length) {
						graph[k] = newGraph;
						newToVisit[k] = 0;
					}
				}
			}
			if (Object.keys(newToVisit).length == 0) {
				break;
			}
			toVisit = newToVisit;
		}
		for (let k in graph) {
			graph[k] = Object.keys(graph[k]);
		}
		return graph;
	}
	
	static connectedComponents(graph) {
		let allNodes = {};
		for (let k in graph) {
			allNodes[k] = 0;
			for (let k2 of graph[k]) {
				allNodes[k2] = 0;
			}
		}
		let count = 0;
		for (let k in allNodes) {
			allNodes[k] = count;
			count = count + 1;
		}
		let changed = true;
		while (changed) {
			changed = false;
			for (let k in graph) {
				for (let k2 of graph[k]) {
					let v1 = allNodes[k];
					let v2 = allNodes[k2];
					if (v1 != v2) {
						changed = true;
						let v3 = Math.min(v1, v2);
						allNodes[k] = v3;
						allNodes[k2] = v3;
					}
				}
			}
		}
		let nodesGrouping = {};
		for (let k in allNodes) {
			let v = allNodes[k];
			if (!(v in nodesGrouping)) {
				nodesGrouping[v] = [];
			}
			nodesGrouping[v].push(k);
		}
		return Object.values(nodesGrouping);
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelGraphs: OcelGraphs};
	global.OcelGraphs = OcelGraphs;
}
catch (err) {
	// not in node
	//console.log(err);
}

class OcelConnectedComponents {
	static findConnCompEvIds(ocel) {
		let evRelGraph = OcelGraphs.eventsRelationGraph(ocel);
		let connComp = {};
		let count = 0;
		for (let evId in ocel["ocel:events"]) {
			connComp[evId] = count;
			count++;
		}
		let cont = true;
		while (cont) {
			cont = false;
			for (let evId in evRelGraph) {
				for (let evId2 in evRelGraph[evId]) {
					if (connComp[evId] != connComp[evId2]) {
						let cc = Math.min(connComp[evId], connComp[evId2]);
						connComp[evId] = cc;
						connComp[evId2] = cc;
						cont = true;
					}
				}
			}
		}
		let connComp1 = {};
		for (let evId in connComp) {
			let cc = connComp[evId];
			if (!(cc in connComp1)) {
				connComp1[cc] = [];
			}
			connComp1[cc].push(evId);
		}
		return connComp1;
	}
	
	
}

try {
	require('../../pm4js.js');
	module.exports = {OcelConnectedComponents: OcelConnectedComponents};
	global.OcelConnectedComponents = OcelConnectedComponents;
}
catch (err) {
	// not in node
	//console.log(err);
}

class OcelIntervalTree {
	static buildEventTimestampIntervalTree(ocel) {
		let events = ocel["ocel:events"];
		let tree = new IntervalTree();
		for (let evId in events) {
			let eve = events[evId];
			let evTimest = eve["ocel:timestamp"].getTime() / 1000.0;
			tree.insert(evTimest-0.00001, evTimest+0.00001, eve);
		}
		let mintime = null;
		for (let n of tree.ascending()) {
			mintime = n.low;
			break;
		}
		let maxtime = null;
		for (let n of tree.descending()) {
			maxtime = n.high;
			break;
		}
		tree.mintime = mintime;
		tree.maxtime = maxtime;
		return tree;
	}
	
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(eve);
			}
		}
		return lif;
	}
	
	static buildObjectLifecycleTimestampIntervalTree(ocel) {
		let objects = ocel["ocel:objects"];
		let objLifecycle = OcelIntervalTree.getObjectsLifecycle(ocel);
		let tree = new IntervalTree();
		for (let objId in objects) {
			let obj = objects[objId];
			let lif = objLifecycle[objId];
			if (lif.length > 0) {
				let st = lif[0]["ocel:timestamp"].getTime() / 1000.0;
				let et = lif[lif.length - 1]["ocel:timestamp"].getTime() / 1000.0;
				if (et > st) {
					tree.insert(st-0.00001, et+0.00001, [obj, lif]);
				}
			}
		}
		let mintime = null;
		for (let n of tree.ascending()) {
			mintime = n.low;
			break;
		}
		let maxtime = null;
		for (let n of tree.descending()) {
			maxtime = n.high;
			break;
		}
		tree.mintime = mintime;
		tree.maxtime = maxtime;
		return tree;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelIntervalTree: OcelIntervalTree};
	global.OcelIntervalTree = OcelIntervalTree;
}
catch (err) {
	// not in node
	//console.log(err);
}

class OcelEventFeatures {
	static apply(ocel, strAttributes=null, numAttributes=null) {
		let activitiesEncoding = OcelEventFeatures.encodeActivity(ocel);
		let timestampEncoding = OcelEventFeatures.encodeTimestamp(ocel);
		let numRelObjEncoding = OcelEventFeatures.encodeNumRelObj(ocel);
		let numRelObjStartEncoding = OcelEventFeatures.encodeNumRelObjStart(ocel);
		let numRelObjEndEncoding = OcelEventFeatures.encodeNumRelObjEnd(ocel);
		let strAttrEncoding = OcelEventFeatures.encodeStrAttrEv(ocel, strAttributes);
		let numAttrEncoding = OcelEventFeatures.encodeNumAttrEv(ocel, numAttributes);
		let featureNames = [...activitiesEncoding["featureNames"], ...timestampEncoding["featureNames"], ...numRelObjEncoding["featureNames"], ...numRelObjStartEncoding["featureNames"], ...numRelObjEndEncoding["featureNames"], ...strAttrEncoding["featureNames"], ...numAttrEncoding["featureNames"]];
		let data = [];
		let count = 0;
		for (let evId in ocel["ocel:events"]) {
			data.push([...activitiesEncoding["data"][count], ...timestampEncoding["data"][count], ...numRelObjEncoding["data"][count], ...numRelObjStartEncoding["data"][count], ...numRelObjEndEncoding["data"][count], ...strAttrEncoding["data"][count], ...numAttrEncoding["data"][count]]);
			count = count + 1;
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static transformToDct(fea) {
		let lst = [];
		let i = 0;
		while (i < fea["data"].length) {
			let dct = {};
			let j = 0;
			while (j < fea["data"][i].length) {
				dct[fea["featureNames"][j]] = fea["data"][i][j];
				j++;
			}
			lst.push(dct);
			i++;
		}
		return lst;
	}
	
	static filterOnVariance(fea, threshold) {
		let varPerFea = OcelEventFeatures.variancePerFea(fea["data"]);
		let filteredIdxs = [];
		let j = 0;
		while (j < varPerFea.length) {
			if (varPerFea[j] >= 0.1) {
				filteredIdxs.push(j);
			}
			j = j + 1;
		}
		let filteredFea = OcelEventFeatures.filterOnIndexes(fea, filteredIdxs);
		return filteredFea;
	}
	
	static filterOnIndexes(fea, idxs) {
		let filteredFea = {"featureNames": [], "data": []};
		let j = 0;
		while (j < idxs.length) {
			filteredFea["featureNames"].push(fea["featureNames"][idxs[j]]);
			j++;
		}
		let i = 0;
		while (i < fea["data"].length) {
			let arr = [];
			j = 0;
			while (j < idxs.length) {
				arr.push(fea["data"][i][idxs[j]]);
				j++;
			}
			filteredFea["data"].push(arr);
			i++;
		}
		return filteredFea;
	}
	
	static variancePerFea(data) {
		let ret = [];
		let j = 0;
		while (j < data[0].length) {
			let avg = 0.0;
			let i = 0;
			while (i < data.length) {
				avg += data[i][j];
				i++;
			}
			avg = avg / data.length;
			let vr = 0.0;
			i = 0;
			while (i < data.length) {
				vr += (data[i][j] - avg)*(data[i][j] - avg)
				i++;
			}
			vr = vr / data.length;
			ret.push(vr);
			j++;
		}
		return ret;
	}
	
	static scaling(fea) {
		let j = 0;
		while (j < fea["featureNames"].length) {
			let minValue = 99999999999;
			let maxValue = -99999999999;
			let i = 0;
			while (i < fea["data"].length) {
				minValue = Math.min(minValue, fea["data"][i][j]);
				maxValue = Math.max(maxValue, fea["data"][i][j]);
				i++;
			}
			i = 0;
			while (i < fea["data"].length) {
				if (minValue != maxValue) {
					fea["data"][i][j] = (fea["data"][i][j] - minValue)/(maxValue - minValue);
				}
				else {
					fea["data"][i][j] = 1;
				}
				i++;
			}
			j++;
		}
		return fea;
	}
	
	static enrichEventLogWithEventFeatures(ocel, strAttributes=null, numAttributes=null) {
		let fea = OcelEventFeatures.apply(ocel, strAttributes, numAttributes);
		let data = fea["data"];
		let featureNames = fea["featureNames"];
		let count = 0;
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			let i = 0;
			while (i < featureNames.length) {
				let fn = featureNames[i];
				let val = data[count][i];
				eve["ocel:vmap"][fn] = val;
				i = i + 1;
			}
			count = count + 1;
		}
		return ocel;
	}
	
	static produceTable(ocel, fea) {
		let featureNames = [...fea["featureNames"]];
		let data = [];
		let events = Object.keys(ocel["ocel:events"]);
		let i = 0;
		while (i < fea["data"].length) {
			data.push([...fea["data"][i]]);
			data[i].unshift(events[i]);
			i = i + 1;
		}
		featureNames.unshift("EVENT_ID");
		i = 0;
		while (i < featureNames.length) {
			featureNames[i] = featureNames[i].replace(new RegExp("@@", 'g'), "").replace(new RegExp("#", 'g'), "_").replace(new RegExp(" ", 'g'), "_");
			i = i + 1;
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeActivity(ocel) {
		let activities = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			activities[eve["ocel:activity"]] = 0;
		}
		activities = Object.keys(activities);
		let arrNull = [];
		for (let act of activities) {
			arrNull.push(0);
		}
		let data = [];
		for (let evId in events) {
			let eve = events[evId];
			let act = eve["ocel:activity"];
			let vect = [...arrNull];
			vect[activities.indexOf(act)] = 1;
			data.push(vect);
		}
		let featureNames = [];
		for (let act of activities) {
			featureNames.push("@@ev_act_" + act.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeTimestamp(ocel) {
		let events = ocel["ocel:events"];
		let data = [];
		for (let evId in events) {
			let eve = events[evId];
			let timest = eve["ocel:timestamp"];
			data.push([timest.getTime() / 1000.0, timest.getDay(), timest.getMonth(), timest.getHours()]);
		}
		let featureNames = ["@@ev_timest_abs", "@@ev_timest_dayofweek", "@@ev_timest_month", "@@ev_timest_hour"];
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeNumRelObj(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let objectTypes = {};
		let otPerObject = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objectTypes[obj["ocel:type"]] = 0;
			otPerObject[objId] = obj["ocel:type"];
		}
		objectTypes = Object.keys(objectTypes);
		let data = [];
		for (let evId in events) {
			let eve = events[evId];
			let arr = [eve["ocel:omap"].length];
			for (let ot of objectTypes) {
				let thisCount = 0;
				for (let objId of eve["ocel:omap"]) {
					if (otPerObject[objId] == ot) {
						thisCount = thisCount + 1;
					}
				}
				arr.push(thisCount);
			}
			data.push(arr);
		}
		let featureNames = ["@@ev_rel_objs_abs"];
		for (let objType of objectTypes) {
			featureNames.push("@@ev_rel_objs_ot_"+objType.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}

	static encodeNumRelObjStart(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let objectTypes = {};
		let otPerObject = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objectTypes[obj["ocel:type"]] = 0;
			otPerObject[objId] = obj["ocel:type"];
		}
		objectTypes = Object.keys(objectTypes);
		let data = [];
		let seenObjects = {};
		for (let evId in events) {
			let eve = events[evId];
			let arr = [];
			for (let ot of objectTypes) {
				let thisCount = 0;
				for (let objId of eve["ocel:omap"]) {
					if (otPerObject[objId] == ot) {
						if (!(objId in seenObjects)) {
							thisCount = thisCount + 1;
						}
					}
				}
				arr.push(thisCount);
			}
			for (let objId of eve["ocel:omap"]) {
				seenObjects[objId] = 0;
			}
			data.push(arr);
		}
		let featureNames = [];
		for (let objType of objectTypes) {
			featureNames.push("@@ev_rel_objs_start_ot_"+objType.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}

	static encodeNumRelObjEnd(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let objectTypes = {};
		let otPerObject = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objectTypes[obj["ocel:type"]] = 0;
			otPerObject[objId] = obj["ocel:type"];
		}
		objectTypes = Object.keys(objectTypes);
		let evIds = Object.keys(events).reverse();
		let lastEventLifecycle = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in lastEventLifecycle)) {
					lastEventLifecycle[objId] = evId;
				}
			}
		}
		evIds = evIds.reverse();
		let data = [];
		for (let evId of evIds) {
			let eve = events[evId];
			let arr = [];
			for (let ot of objectTypes) {
				let thisCount = 0;
				for (let objId of eve["ocel:omap"]) {
					if (otPerObject[objId] == ot) {
						if (lastEventLifecycle[objId] == evId) {
							thisCount = thisCount + 1;
						}
					}
				}
				arr.push(thisCount);
			}
			data.push(arr);
		}
		let featureNames = [];
		for (let objType of objectTypes) {
			featureNames.push("@@ev_rel_objs_end_ot_"+objType.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeStrAttrEv(ocel, strAttributes=null) {
		if (strAttributes == null) {
			strAttributes = [];
		}
		let events = ocel["ocel:events"];
		let data = [];
		let featureNames = [];
		
		for (let evId in events) {
			data.push([]);
		}
		for (let attr of strAttributes) {
			let diffValues = {};
			for (let evId in events) {
				let eve = events[evId];
				if (attr in eve["ocel:vmap"]) {					
					diffValues[eve["ocel:vmap"][attr]] = 0;
				}
			}
			diffValues = Object.keys(diffValues);
			let zeroArr = [];
			for (let val of diffValues) {
				featureNames.push("@@ev_attr_"+attr.replace(/[\W_]+/g," ")+"_"+val.replace(/[\W_]+/g," "));
				zeroArr.push(0);
			}
			let count = 0;
			for (let evId in events) {
				let eve = events[evId];
				let vect = [...zeroArr];
				if (attr in eve["ocel:vmap"]) {
					let val = eve["ocel:vmap"][attr];
					vect[diffValues.indexOf(val)] = 1;
				}
				data[count] = [...data[count], ...vect];
				count = count + 1;
			}
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeNumAttrEv(ocel, numAttributes=null) {
		if (numAttributes == null) {
			numAttributes = [];
		}
		let events = ocel["ocel:events"];
		let data = [];
		let featureNames = [];
		for (let evId in events) {
			data.push([]);
		}
		for (let attr of numAttributes) {
			let count = 0;
			for (let evId in events) {
				let eve = events[evId];
				if (attr in eve["ocel:vmap"]) {
					data[count].push(eve["ocel:vmap"][attr]);
				}
				else {
					data[count].push(0);
				}
				count = count + 1;
			}
			featureNames.push("@@ev_num_attr_"+attr.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelEventFeatures: OcelEventFeatures};
	global.OcelEventFeatures = OcelEventFeatures;
}
catch (err) {
	// not in node
	//console.log(err);
}


class OcelObjectFeatures {
	static apply(ocel, strAttributes=null, numAttributes=null) {
		let objStrAttr = OcelObjectFeatures.encodeObjStrAttr(ocel, strAttributes);
		let objNumAttr = OcelObjectFeatures.encodeObjNumAttr(ocel, numAttributes);
		let objLifecycleActivities = OcelObjectFeatures.encodeLifecycleActivities(ocel);
		let objLifecycleDuration = OcelObjectFeatures.encodeLifecycleDuration(ocel);
		let objLifecycleLength = OcelObjectFeatures.encodeLifecycleLength(ocel);
		let overallObjectGraphs = OcelObjectFeatures.encodeOverallObjectGraphs(ocel);
		let interactionGraphOt = OcelObjectFeatures.encodeInteractionGraphOt(ocel);
		let wip = OcelObjectFeatures.encodeWip(ocel);
		let featureNames = [...objStrAttr["featureNames"], ...objNumAttr["featureNames"], ...objLifecycleActivities["featureNames"], ...objLifecycleDuration["featureNames"], ...objLifecycleLength["featureNames"], ...overallObjectGraphs["featureNames"], ...interactionGraphOt["featureNames"], ...wip["featureNames"]];
		let data = [];
		let objects = ocel["ocel:objects"];
		let count = 0;
		for (let objId in objects) {
			data.push([...objStrAttr["data"][count], ...objNumAttr["data"][count], ...objLifecycleActivities["data"][count], ...objLifecycleDuration["data"][count], ...objLifecycleLength["data"][count], ...overallObjectGraphs["data"][count], ...interactionGraphOt["data"][count], ...wip["data"][count]]);
			count = count + 1;
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static transformToDct(fea) {
		let lst = [];
		let i = 0;
		while (i < fea["data"].length) {
			let dct = {};
			let j = 0;
			while (j < fea["data"][i].length) {
				dct[fea["featureNames"][j]] = fea["data"][i][j];
				j++;
			}
			lst.push(dct);
			i++;
		}
		return lst;
	}
	
	static filterOnVariance(fea, threshold) {
		let varPerFea = OcelObjectFeatures.variancePerFea(fea["data"]);
		let filteredIdxs = [];
		let j = 0;
		while (j < varPerFea.length) {
			if (varPerFea[j] >= 0.1) {
				filteredIdxs.push(j);
			}
			j = j + 1;
		}
		let filteredFea = OcelObjectFeatures.filterOnIndexes(fea, filteredIdxs);
		return filteredFea;
	}
	
	static filterOnIndexes(fea, idxs) {
		let filteredFea = {"featureNames": [], "data": []};
		let j = 0;
		while (j < idxs.length) {
			filteredFea["featureNames"].push(fea["featureNames"][idxs[j]]);
			j++;
		}
		let i = 0;
		while (i < fea["data"].length) {
			let arr = [];
			j = 0;
			while (j < idxs.length) {
				arr.push(fea["data"][i][idxs[j]]);
				j++;
			}
			filteredFea["data"].push(arr);
			i++;
		}
		return filteredFea;
	}
	
	static variancePerFea(data) {
		let ret = [];
		let j = 0;
		while (j < data[0].length) {
			let avg = 0.0;
			let i = 0;
			while (i < data.length) {
				avg += data[i][j];
				i++;
			}
			avg = avg / data.length;
			let vr = 0.0;
			i = 0;
			while (i < data.length) {
				vr += (data[i][j] - avg)*(data[i][j] - avg)
				i++;
			}
			vr = vr / data.length;
			ret.push(vr);
			j++;
		}
		return ret;
	}
	
	static scaling(fea) {
		let j = 0;
		while (j < fea["featureNames"].length) {
			let minValue = 99999999999;
			let maxValue = -99999999999;
			let i = 0;
			while (i < fea["data"].length) {
				minValue = Math.min(minValue, fea["data"][i][j]);
				maxValue = Math.max(maxValue, fea["data"][i][j]);
				i++;
			}
			i = 0;
			while (i < fea["data"].length) {
				if (minValue != maxValue) {
					fea["data"][i][j] = (fea["data"][i][j] - minValue)/(maxValue - minValue);
				}
				else {
					fea["data"][i][j] = 1;
				}
				i++;
			}
			j++;
		}
		return fea;
	}
	
	static enrichEventLogWithObjectFeatures(ocel, strAttributes=null, numAttributes=null) {
		let fea = OcelObjectFeatures.apply(ocel, strAttributes, numAttributes);
		let data = fea["data"];
		let featureNames = fea["featureNames"];
		let count = 0;
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			let obj = objects[objId];
			let i = 0;
			while (i < featureNames.length) {
				let fn = featureNames[i];
				let val = data[count][i];
				obj["ocel:ovmap"][fn] = val;
				i = i + 1;
			}
			count = count + 1;
		}
		return ocel;
	}
	
	static produceTable(ocel, fea) {
		let featureNames = [...fea["featureNames"]];
		let data = [];
		let objects = Object.keys(ocel["ocel:objects"]);
		let i = 0;
		while (i < fea["data"].length) {
			data.push([...fea["data"][i]]);
			data[i].unshift(objects[i]);
			i = i + 1;
		}
		featureNames.unshift("OBJECT_ID");
		i = 0;
		while (i < featureNames.length) {
			featureNames[i] = featureNames[i].replace(new RegExp("@@", 'g'), "").replace(new RegExp("#", 'g'), "_").replace(new RegExp(" ", 'g'), "_");
			i = i + 1;
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeObjStrAttr(ocel, strAttributes=null) {
		if (strAttributes == null) {
			strAttributes = [];
		}
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = [];
		
		for (let objId in objects) {
			data.push([]);
		}
		for (let attr of strAttributes) {
			let diffValues = {};
			for (let objId in objects) {
				let obj = objects[objId];
				if (attr in obj["ocel:ovmap"]) {
					diffValues[obj["ocel:ovmap"][attr]] = 0;
				}
			}
			diffValues = Object.keys(diffValues);
			let zeroArr = [];
			for (let val of diffValues) {
				featureNames.push("@@obj_attr_"+attr.replace(/[\W_]+/g," ")+"_"+val.replace(/[\W_]+/g," "));
				zeroArr.push(0);
			}
			let count = 0;
			for (let objId in objects) {
				let obj = objects[objId];
				let vect = [...zeroArr];
				if (attr in obj["ocel:ovmap"]) {
					let val = obj["ocel:ovmap"][attr];
					vect[diffValues.indexOf(val)] = 1;
				}
				data[count] = [...data[count], ...vect];
				count = count + 1;
			}
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeObjNumAttr(ocel, numAttributes=null) {
		if (numAttributes == null) {
			numAttributes = [];
		}
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = [];
		
		for (let objId in objects) {
			data.push([]);
		}
		
		for (let attr of numAttributes) {
			let count = 0;
			for (let objId in objects) {
				let obj = objects[objId];
				if (attr in obj["ocel:ovmap"]) {
					data[count].push(obj["ocel:ovmap"][attr]);
				}
				else {
					data[count].push(0);
				}
				count = count + 1;
			}
			featureNames.push("@@obj_num_attr_"+attr.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(eve);
			}
		}
		return lif;
	}
	
	static encodeLifecycleActivities(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let diffActivities = {};
		for (let evId in events) {
			let eve = events[evId];
			diffActivities[eve["ocel:activity"]] = 0;
		}
		diffActivities = Object.keys(diffActivities);
		let zeroArr = [];
		for (let act of diffActivities) {
			zeroArr.push(0);
		}
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		let data = [];
		for (let objId in objects) {
			let lif = objLifecycle[objId];
			let vect = [...zeroArr];
			for (let eve of lif) {
				vect[diffActivities.indexOf(eve["ocel:activity"])] += 1;
			}
			data.push(vect);
		}
		let featureNames = [];
		for (let act of diffActivities) {
			featureNames.push("@@obj_lif_act_"+act.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeLifecycleDuration(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = ["@@obj_lif_dur"];
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		for (let objId in objects) {
			let lif = objLifecycle[objId];
			if (lif.length > 0) {
				let st = lif[0]["ocel:timestamp"].getTime();
				let et = lif[lif.length - 1]["ocel:timestamp"].getTime();
				data.push([(et-st)/1000.0]);
			}
			else {
				data.push([0]);
			}
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeLifecycleLength(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = ["@@obj_lif_length"];
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		for (let objId in objects) {
			let lif = objLifecycle[objId];
			data.push([lif.length]);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeOverallObjectGraphs(ocel) {
		let interactionGraph = OcelGraphs.objectInteractionGraph(ocel);
		let descendantsGraph = OcelGraphs.objectDescendantsGraph(ocel);
		let cobirthGraph = OcelGraphs.objectCobirthGraph(ocel);
		let codeathGraph = OcelGraphs.objectCodeathGraph(ocel);
		let inheritanceGraph = OcelGraphs.objectInheritanceGraph(ocel);
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = ["@@object_overall_interactions", "@@object_overall_descendants", "@@object_overall_cobirth", "@@object_overall_codeath", "@@object_overall_inheritance"];
		for (let objId in objects) {
			let interactions = 0;
			let descendants = 0;
			let cobirth = 0;
			let codeath = 0;
			let inheritance = 0;
			if (objId in interactionGraph) {
				interactions = interactionGraph[objId].length;
			}
			if (objId in descendantsGraph) {
				descendants = descendantsGraph[objId].length;
			}
			if (objId in cobirthGraph) {
				cobirth = cobirthGraph[objId].length;
			}
			if (objId in codeathGraph) {
				codeath = codeathGraph[objId].length;
			}
			if (objId in inheritanceGraph) {
				inheritance = inheritanceGraph[objId].length;
			}
			data.push([interactions, descendants, cobirth, codeath, inheritance]);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeInteractionGraphOt(ocel) {
		let interactionGraph = OcelGraphs.objectInteractionGraph(ocel);
		let objects = ocel["ocel:objects"];
		let objOt = {};
		let objectTypes = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objOt[objId] = obj["ocel:type"];
			objectTypes[obj["ocel:type"]] = 0;
		}
		objectTypes = Object.keys(objectTypes);
		let data = [];
		let featureNames = [];
		for (let ot of objectTypes) {
			featureNames.push("@@object_interaction_ot_" + ot.replace(/[\W_]+/g," "));
		}
		for (let objId in objects) {
			let interactions = interactionGraph[objId];
			let arr = [];
			for (let ot of objectTypes) {
				let count = 0;
				if (interactions != null) {
					for (let objId2 of interactions) {
						if (objOt[objId2] == ot) {
							count = count + 1
						}
					}
				}
				arr.push(count);
			}
			data.push(arr);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeWip(ocel) {
		let tree = OcelIntervalTree.buildObjectLifecycleTimestampIntervalTree(ocel);
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		let data = [];
		let featureNames = ["@@object_wip"];
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			let obj = objects[objId];
			let lif = objLifecycle[objId];
			if (lif.length > 0) {
				let st = lif[0]["ocel:timestamp"].getTime() / 1000.0;
				let et = lif[lif.length - 1]["ocel:timestamp"].getTime() / 1000.0;
				let intersectionAfterBefore = IntervalTreeAlgorithms.queryInterval(tree, st, et);
				data.push([intersectionAfterBefore.length]);
			}
			else {
				data.push([0]);
			}
		}
		return {"data": data, "featureNames": featureNames};
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelObjectFeatures: OcelObjectFeatures};
	global.OcelObjectFeatures = OcelObjectFeatures;
}
catch (err) {
	// not in node
	//console.log(err);
}


class EventLogToStream {
	static shallowCopy(eve0) {
		let eve = new Event();
		for (let attr in eve0.attributes) {
			eve.attributes[attr] = eve0.attributes[attr];
		}
		return eve;
	}
	
	static apply(eventLog, sortingAttribute="time:timestamp", casePrefix="case:") {
		let stream = [];
		for (let trace of eventLog.traces) {
			for (let eve0 of trace.events) {
				let eve = EventLogToStream.shallowCopy(eve0);
				for (let traceAttr in trace.attributes) {
					let traceAttrValue = trace.attributes[traceAttr];
					eve.attributes[casePrefix+traceAttr] = traceAttrValue;
				}
				stream.push(eve);
			}
		}
		stream.sort((a, b) => { return a.attributes[sortingAttribute].value - b.attributes[sortingAttribute].value });
		return stream;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {EventLogToStream: EventLogToStream};
	global.EventLogToStream = EventLogToStream;
}
catch (err) {
	// not in node
	//console.log(err);
}


class StreamAttrWrapper {
	static accessAttribute(eve, attribute) {
		if (eve.constructor.name == "Event") {
			// EventLog Event
			if (attribute in eve.attributes) {
				return eve.attributes[attribute].value;
			}
		}
		else {
			// OCEL
			if (attribute == "ocel:activity" || attribute == "ocel:timestamp") {
				return eve[attribute];
			}
			else if (attribute in eve["ocel:vmap"]) {
				return eve["ocel:vmap"][attribute];
			}
		}
		return null;
	}
	
	static attributesList(stream) {
		let attList = {};
		if (stream.length > 0) {
			if (stream[0].constructor.name == "Event") {
				// EventLog Event
				for (let eve of stream) {
					for (let attr in eve.attributes) {
						attList[attr] = 0;
					}
				}
			}
			else {
				// OCEL
				attList["ocel:activity"] = 0;
				attList["ocel:timestamp"] = 0;
				for (let eve of stream) {
					for (let attr in eve["ocel:vmap"]) {
						attList[attr] = 0;
					}
				}
			}
		}
		return Object.keys(attList);
	}
	
	static defaultTimestamp(eve) {
		if (eve.constructor.name == "Event") {
			// EventLog Event
			return eve.attributes["time:timestamp"].value;
		}
		else {
			// OCEL
			return eve["ocel:timestamp"];
		}
	}
}

try {
	require('../../pm4js.js');
	module.exports = {StreamAttrWrapper: StreamAttrWrapper};
	global.StreamAttrWrapper = StreamAttrWrapper;
}
catch (err) {
	// not in node
	//console.log(err);
}


class OcelLinkAnalysis {
	static linkEventsWithObjGraph(ocel, objGraph) {
		let relEvs = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in relEvs)) {
					relEvs[objId] = [];
				}
				relEvs[objId].push(evId);
			}
		}
		let links = {};
		for (let k in objGraph) {
			for (let k2 of objGraph[k]) {
				for (let e1 of relEvs[k]) {
					for (let e2 of relEvs[k2]) {
						if (!(e1 in links)) {
							links[e1] = {};
						}
						links[e1][e2] = 0;
					}
				}
			}
		}
		for (let k in links) {
			links[k] = Object.keys(links[k]);
		}
		return links;
	}
	
	static linkAnalysisAttributeOutIn(ocel, outAttribute, inAttribute) {
		let outAttributeValuesEvents = {};
		let inAttributeValuesEvents = {};
		let linkedEventsPos = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			let val = StreamAttrWrapper.accessAttribute(eve, outAttribute);
			if (val != null) {
				if (!(val in outAttributeValuesEvents)) {
					outAttributeValuesEvents[val] = [];
				}
				outAttributeValuesEvents[val].push(evId);
			}
			val = StreamAttrWrapper.accessAttribute(eve, inAttribute);
			if (val != null) {
				if (!(val in inAttributeValuesEvents)) {
					inAttributeValuesEvents[val] = [];
				}
				inAttributeValuesEvents[val].push(evId);
			}
		}
		for (let val in outAttributeValuesEvents) {
			if (val in inAttributeValuesEvents) {
				for (let i1 of outAttributeValuesEvents[val]) {
					if (!(i1 in linkedEventsPos)) {
						linkedEventsPos[i1] = {};
					}
					for (let i2 of inAttributeValuesEvents[val]) {
						linkedEventsPos[i1][i2] = 0;
					}
				}
			}
		}
		for (let idx in linkedEventsPos) {
			linkedEventsPos[idx] = Object.keys(linkedEventsPos[idx]);
		}
		return linkedEventsPos;
	}
	
	static filterLinksByTimestamp(ocel, eveLinks) {
		let links = {};
		let events = ocel["ocel:events"];
		for (let k in eveLinks) {
			let tk = events[k]["ocel:timestamp"];
			for (let k2 of eveLinks[k]) {
				let tk2 = events[k2]["ocel:timestamp"];
				if (tk < tk2) {
					if (!(k in links)) {
						links[k] = [];
					}
					links[k].push(k2);
				}
			}
		}
		return links;
	}
	
	static filterFirstLink(ocel, eveLinks) {
		let links = {};
		for (let k in eveLinks) {
			links[k] = [eveLinks[k][0]];
		}
		return links;
	}
	
	static expandLinks(stream, links0) {
		let links = {};
		for (let k in links0) {
			links[k] = {};
			for (let k2 of links0[k]) {
				links[k][k2] = 0;
			}
		}
		let toVisit = {};
		let invGraph = {};
		for (let k in links) {
			if (!(k in invGraph)) {
				invGraph[k] = [];
			}
			for (let k2 in links[k]) {
				if (!(k2 in invGraph)) {
					invGraph[k2] = {};
				}
				invGraph[k2][k] = 0;
			}
		}
		for (let k in links) {
			toVisit[k] = 0;
		}
		while (true) {
			let newToVisit = {};
			for (let k2 in toVisit) {
				for (let k in invGraph[k2]) {
					let newGraph = Object.assign({}, links[k]);
					for (let k3 in links[k2]) {
						newGraph[k3] = 0;
					}
					if (Object.keys(newGraph).length > Object.keys(links[k]).length) {
						links[k] = newGraph;
						newToVisit[k] = 0;
					}
				}
			}
			if (Object.keys(newToVisit).length == 0) {
				break;
			}
			toVisit = newToVisit;
		}
		for (let k in links) {
			links[k] = Object.keys(links[k]);
		}
		return links;
	}
	
	static linksToFinalForm(ocel, eveLinks) {
		let links = [];
		let events = ocel["ocel:events"];
		for (let k in eveLinks) {
			for (let k2 of eveLinks[k]) {
				links.push([events[k], events[k2]]);
			}
		}
		return links;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelLinkAnalysis: OcelLinkAnalysis};
	global.OcelLinkAnalysis = OcelLinkAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}


class LogLinksAnalysis {
	static linkAnalysisAttributeOutIn(stream, outAttribute, inAttribute) {
		let outAttributeValuesEvents = {};
		let inAttributeValuesEvents = {};
		let linkedEventsPos = {};
		let i = 0;
		while (i < stream.length) {
			let eve = stream[i];
			let val = StreamAttrWrapper.accessAttribute(eve, outAttribute);
			if (val != null) {
				if (!(val in outAttributeValuesEvents)) {
					outAttributeValuesEvents[val] = [];
				}
				outAttributeValuesEvents[val].push(i);
			}
			val = StreamAttrWrapper.accessAttribute(eve, inAttribute);
			if (val != null) {
				if (!(val in inAttributeValuesEvents)) {
					inAttributeValuesEvents[val] = [];
				}
				inAttributeValuesEvents[val].push(i);
			}
			i = i + 1;
		}
		for (let val in outAttributeValuesEvents) {
			if (val in inAttributeValuesEvents) {
				for (let i1 of outAttributeValuesEvents[val]) {
					if (!(i1 in linkedEventsPos)) {
						linkedEventsPos[i1] = {};
					}
					for (let i2 of inAttributeValuesEvents[val]) {
						linkedEventsPos[i1][i2] = 0;
					}
				}
			}
		}
		for (let idx in linkedEventsPos) {
			linkedEventsPos[idx] = Object.keys(linkedEventsPos[idx]);
		}
		return linkedEventsPos;
	}
	
	static filterLinksByTimestamp(stream, oldLinks) {
		let links = {};
		for (let k1 in oldLinks) {
			let n1 = parseInt(k1);
			for (let k2 of oldLinks[k1]) {
				let n2 = parseInt(k2);
				if (n2 > n1) {
					if (!(k1 in links)) {
						links[k1] = [];
					}
					links[k1].push(k2);
				}
			}
		}
		return links;
	}
	
	static filterFirstLink(stream, oldLinks) {
		let links = {};
		for (let k1 in oldLinks) {
			links[k1] = [oldLinks[k1][0]];
		}
		return links;
	}
	
	static expandLinks(stream, links0) {
		let links = {};
		for (let k in links0) {
			links[k] = {};
			for (let k2 of links0[k]) {
				links[k][k2] = 0;
			}
		}
		let toVisit = {};
		let invGraph = {};
		for (let k in links) {
			if (!(k in invGraph)) {
				invGraph[k] = [];
			}
			for (let k2 in links[k]) {
				if (!(k2 in invGraph)) {
					invGraph[k2] = {};
				}
				invGraph[k2][k] = 0;
			}
		}
		for (let k in links) {
			toVisit[k] = 0;
		}
		while (true) {
			let newToVisit = {};
			for (let k2 in toVisit) {
				for (let k in invGraph[k2]) {
					let newGraph = Object.assign({}, links[k]);
					for (let k3 in links[k2]) {
						newGraph[k3] = 0;
					}
					if (Object.keys(newGraph).length > Object.keys(links[k]).length) {
						links[k] = newGraph;
						newToVisit[k] = 0;
					}
				}
			}
			if (Object.keys(newToVisit).length == 0) {
				break;
			}
			toVisit = newToVisit;
		}
		for (let k in links) {
			links[k] = Object.keys(links[k]);
		}
		return links;
	}
	
	static linksToFinalForm(stream, oldLinks) {
		let links = [];
		for (let k1 in oldLinks) {
			let n1 = parseInt(k1);
			for (let k2 of oldLinks[k1]) {
				let n2 = parseInt(k2);
				links.push([stream[n1], stream[n2]]);
			}
		}
		return links;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {LogLinksAnalysis: LogLinksAnalysis};
	global.LogLinksAnalysis = LogLinksAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}


class NetworkAnalysisResult {
	constructor(nodes, multiEdges) {
		this.nodes = nodes;
		this.multiEdges = multiEdges;
	}
}

class NetworkAnalysis {
	static apply(links, sourceNodeAgg, targetNodeAgg, edgeAgg, source=true) {
		let nodes = {};
		let multiEdges = {};
		for (let el of links) {
			let se = el[0];
			let te = el[1];
			let sn = StreamAttrWrapper.accessAttribute(se, sourceNodeAgg);
			let tn = StreamAttrWrapper.accessAttribute(te, targetNodeAgg);
			let eg = null;
			if (source) {
				eg = StreamAttrWrapper.accessAttribute(se, edgeAgg);
			}
			else {
				eg = StreamAttrWrapper.accessAttribute(te, edgeAgg);
			}
			
			if (sn != null && tn != null && eg != null) {
				eg = [sn, tn, eg];
				
				let st = StreamAttrWrapper.defaultTimestamp(se).getTime();
				let tt = StreamAttrWrapper.defaultTimestamp(te).getTime();
				let diff = (tt - st) / 1000.0;
				
				if (!(sn in nodes)) {
					nodes[sn] = {"IN": 0, "OUT": 0};
				}
				if (!(tn in nodes)) {
					nodes[tn] = {"IN": 0, "OUT": 0};
				}
				if (!(eg in multiEdges)) {
					multiEdges[eg] = {"count": 0, "timeDiff": []};
				}
				nodes[sn]["OUT"] += 1;
				nodes[tn]["IN"] += 1;
				multiEdges[eg]["count"] += 1;
				multiEdges[eg]["timeDiff"].push(diff);
			}
		}
		return new NetworkAnalysisResult(nodes, multiEdges);
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {NetworkAnalysis: NetworkAnalysis};
	global.NetworkAnalysis = NetworkAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}


class NetworkAnalysisGraphvizVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = NetworkAnalysisGraphvizVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static calculateAverage(times) {
		if (times.length > 0) {
			let sum = 0;
			for (let el of times) {
				sum += el;
			}
			return sum / times.length;
		}
		return 0;
	}
	
	
	static apply(networkAnalysis, performance=false) {
		let ret = [];
		ret.push("digraph G {");
		let nodesMap = {};
		for (let nk in networkAnalysis.nodes) {
			let nstats = networkAnalysis.nodes[nk];
			let nuid = NetworkAnalysisGraphvizVisualizer.nodeUuid();
			nodesMap[nk] = nuid;
			ret.push(nuid+" [shape=ellipse, label=\""+nk+"\nIN="+nstats["IN"]+"\nOUT="+nstats["OUT"]+"\"]");
		}
		for (let eg in networkAnalysis.multiEdges) {
			let estats = networkAnalysis.multiEdges[eg];
			let egs = eg.split(",");
			let sn = egs[0];
			let tn = egs[1];
			let ml = egs[2];
			let label = ml+"\n";
			if (performance) {
				let perf = NetworkAnalysisGraphvizVisualizer.calculateAverage(estats["timeDiff"]);
				label += humanizeDuration(Math.round(perf*1000));
			}
			else {
				label += "(" + estats["count"]+")";
			}
			ret.push(nodesMap[sn]+" -> "+nodesMap[tn]+" [label=\""+label+"\"]");
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	module.exports = {NetworkAnalysisGraphvizVisualizer: NetworkAnalysisGraphvizVisualizer};
	global.NetworkAnalysisGraphvizVisualizer = NetworkAnalysisGraphvizVisualizer;
}
catch (err) {
	// not in node
}


class GeneralOcelStatistics {
	static eventsPerActivityCount(ocel) {
		let dct = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			let act = eve["ocel:activity"];
			if (!(act in dct)) {
				dct[act] = 1;
			}
			else {
				dct[act] += 1;
			}
		}
		return dct;
	}
	
	static objectsPerTypeCount(ocel) {
		let dct = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			let obj = objects[objId];
			let type = obj["ocel:type"];
			if (!(type in dct)) {
				dct[type] = 1;
			}
			else {
				dct[type] += 1;
			}
		}
		return dct;
	}
	
	static eventsRelatedPerObjectTypeCount(ocel) {
		let objects = ocel["ocel:objects"];
		let objType = {};
		let dct = {};
		for (let objId in objects) {
			let obj = objects[objId];
			let type = obj["ocel:type"];
			objType[objId] = type;
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			let relatedTypes = {};
			for (let objId of eve["ocel:omap"]) {
				relatedTypes[objType[objId]] = 0;
			}
			for (let otype in relatedTypes) {
				if (!(otype in dct)) {
					dct[otype] = 1;
				}
				else {
					dct[otype] += 1;
				}
			}
		}
		return dct;
	}
	
	static objectsPerTypePerActivity(ocel, retSum=false) {
		// convergence problem
		let objects = ocel["ocel:objects"];
		let objType = {};
		let dct = {};
		for (let objId in objects) {
			let obj = objects[objId];
			let type = obj["ocel:type"];
			objType[objId] = type;
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			if (eve["ocel:omap"].length > 0) {
				let evAct = eve["ocel:activity"];
				if (!(evAct in dct)) {
					dct[evAct] = {};
				}
				let relatedTypes = {};
				for (let objId of eve["ocel:omap"]) {
					let otype = objType[objId];
					if (!(otype in relatedTypes)) {
						relatedTypes[otype] = 1;
					}
					else {
						relatedTypes[otype] += 1;
					}
				}
				for (let otype in relatedTypes) {
					if (!(otype in dct[evAct])) {
						dct[evAct][otype] = {};
					}
					if (!(relatedTypes[otype] in dct[evAct][otype])) {
						dct[evAct][otype][relatedTypes[otype]] = 0;
					}
					dct[evAct][otype][relatedTypes[otype]] += 1;
				}
			}
		}
		for (let evAct in dct) {
			for (let otype in dct[evAct]) {
				let count = 0;
				let sum = 0;
				for (let sc in dct[evAct][otype]) {
					let nc = parseInt(sc);
					let cc = dct[evAct][otype][sc];
					count += cc;
					sum += nc * cc;
				}
				if (retSum) {
					dct[evAct][otype] = sum;
				}
				else {
					dct[evAct][otype] = sum / count;
				}
			}
		}
		return dct;
	}
	
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(eve);
			}
		}
		return lif;
	}
	
	static eventsPerTypePerActivity(ocel, retSum=false) {
		let objects = ocel["ocel:objects"];
		let otObjects = {};
		let objType = {};
		for (let objId in objects) {
			let obj = objects[objId];
			let ot = obj["ocel:type"];
			objType[objId] = ot;
			if (!(ot in otObjects)) {
				otObjects[ot] = [];
			}
			otObjects[ot].push(objId);
		}
		let objectTypes = Object.keys(otObjects);
		let lifecycle = GeneralOcelStatistics.getObjectsLifecycle(ocel);
		let dct = {};
		for (let ot of objectTypes) {
			dct[ot] = {};
			for (let objId of otObjects[ot]) {
				let lif = lifecycle[objId];
				let temp = {};
				let i = 0;
				while (i < lif.length) {
					let act = lif[i]["ocel:activity"];
					if (!(act in temp)) {
						temp[act] = 1;
					}
					else {
						temp[act] += 1;
					}
					i = i + 1
				}
				for (let act in temp) {
					if (!(act in dct[ot])) {
						dct[ot][act] = {};
					}
					if (!(temp[act] in dct[ot][act])) {
						dct[ot][act][temp[act]] = 1;
					}
					else {
						dct[ot][act][temp[act]] += 1;
					}
				}
			}
		}
		for (let ot in dct) {
			for (let act in dct[ot]) {
				let count = 0;
				let sum = 0;
				for (let sc in dct[ot][act]) {
					let nc = parseInt(sc);
					let cc = dct[ot][act][sc];
					count += cc;
					sum += nc * cc;
				}
				if (retSum) {
					dct[ot][act] = sum;
				}
				else {
					dct[ot][act] = sum / count;
				}
			}
		}
		return dct;
	}
	
	static getEssentialEventsWithCategorization(ocel) {
		let essEvents = {};
		let ocelEvents = Object.keys(ocel["ocel:events"]);
		let ocelEventsReversed = Object.keys(ocel["ocel:events"]);
		ocelEventsReversed.reverse();
		let lastEventPerLifecycle = {};
		for (let evId of ocelEventsReversed) {
			let eve = ocel["ocel:events"][evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in lastEventPerLifecycle)) {
					lastEventPerLifecycle[objId] = evId;
				}
			}
		}
		let seenObjects = {};
		let relations = {};
		for (let evId of ocelEvents) {
			let eve = ocel["ocel:events"][evId];
			let isFirstLifecycle = 0;
			let isLastLifecycle = 0;
			let newRelationsOccured = 0;
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					seenObjects[objId] = evId;
					isFirstLifecycle += 1;
				}
				if (lastEventPerLifecycle[objId] == evId) {
					isLastLifecycle += 1;
				}
				for (let objId2 of eve["ocel:omap"]) {
					if (objId < objId2) {
						if (!([objId, objId2] in relations)) {
							relations[[objId, objId2]] = 0;
							newRelationsOccured += 1;
						}
					}
				}
			}
			if (isFirstLifecycle > 0 || isLastLifecycle > 0 || newRelationsOccured > 0) {
				essEvents[evId] = {"isFirstLifecycle": isFirstLifecycle, "isLastLifecycle": isLastLifecycle, "newRelationsOccured": newRelationsOccured};
			}
		}
		return essEvents;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {GeneralOcelStatistics: GeneralOcelStatistics};
	global.GeneralOcelStatistics = GeneralOcelStatistics;
}
catch (err) {
	// not in node
	//console.log(err);
}


class DtUtils {
	static dtToNodes(decisionTree) {
		let rootNode = decisionTree.root;
		rootNode.depth = 0;
		rootNode.categories = {};
		rootNode.parent = null;
		let visited = [];
		let toVisit = [rootNode];
		while (toVisit.length > 0) {
			let el = toVisit.pop();
			visited.push(el);
			if (el.category == null) {
				let lst = [el.match, el.notMatch];
				for (let el2 of lst) {
					if (el2 != null) {
						el2.depth = el.depth + 1;
						el2.categories = {};
						el2.parent = el;
						toVisit.push(el2);
					}
				}
			}
		}
		visited.reverse();
		let i = 0;
		while (i < visited.length) {
			let el = visited[i];
			let match = el.match;
			let notMatch = el.notMatch;
			if (match != null) {
				if (match.category != null) {
					el.categories[match.category] = el.matchedCount;
				}
				else {
					for (let cat in match.categories) {
						if (!(cat in el.categories)) {
							el.categories[cat] = match.categories[cat];
						}
						else {
							el.categories[cat] += match.categories[cat];
						}
					}
				}
			}
			if (notMatch != null) {
				if (notMatch.category != null) {
					el.categories[notMatch.category] = el.notMatchedCount;
				}
				else {
					for (let cat in notMatch.categories) {
						if (!(cat in el.categories)) {
							el.categories[cat] = notMatch.categories[cat];
						}
						else {
							el.categories[cat] += notMatch.categories[cat];
						}
					}
				}
			}
			i++;
		}
		visited.reverse();
		i = 0;
		while (i < visited.length) {
			visited[i].nidx = i;
			if (visited[i].categories != null) {
				let cat = Object.keys(visited[i].categories);
				let mc = cat[0];
				let mcc = visited[i].categories[mc];
				let summ = mcc;
				let j = 1;
				while (j < cat.length) {
					let thiscc = visited[i].categories[cat[j]]
					if (thiscc > mcc) {
						mc = cat[j];
						mcc = thiscc;
					}
					summ += thiscc;
					j++;
				}
				visited[i].mainCategory = mc;
				visited[i].mainCategoryCount = mcc;
				visited[i].mainCategoryPrevalence = mcc / summ;
			}
			i++;
		}
		return visited;
	}
	
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = DtUtils.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static getGvizString(nodes) {
		let ret = ["digraph G {"];
		let nodeUuids = {};
		for (let n of nodes) {
			let nuid = DtUtils.nodeUuid();
			nodeUuids[n.nidx] = nuid;
			let label = "";
			if (n.attribute != null) {
				label = n.attribute + " " + n.predicateName + " " + n.pivot + "\nN="+n.matchedCount+n.notMatchedCount+"\ncat = " + n.mainCategory+" ("+Math.round(n.mainCategoryPrevalence * 100, 2)+" %)";
			}
			else {
				label = "cat = "+n.category;
			}
			ret.push(nuid+" [label=\""+label+"\", shape=\"box\"];");
		}
		for (let n of nodes) {
			if (n.attribute != null) {
				ret.push(nodeUuids[n.nidx]+" -> "+nodeUuids[n.match.nidx]+" [label=\"True\"];");
				ret.push(nodeUuids[n.nidx]+" -> "+nodeUuids[n.notMatch.nidx]+" [label=\"False\"];");
			}
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	module.exports = {DtUtils: DtUtils};
	global.DtUtils = DtUtils;
}
catch (err) {
	// not in node
}


class DagreBPMNLayouting {
	static apply(bpmnGraph, nodesep=null, edgesep=null, ranksep=null, targetSvg="svg", targetInner="g", d3Obj=null, dagreD3Obj=null) {
		// works only in browser
		// works only with Dagre/D3
		if (d3Obj == null) {
			d3Obj = d3;
		}
		if (dagreD3Obj == null) {
			dagreD3Obj = dagreD3;
		}
		let ordered = bpmnGraph.getOrderedNodesAndEdges();
		
		var g = new dagreD3Obj.graphlib.Graph().setGraph({});
		
		for (let nodeId of ordered["nodesId"]) {
			let node = bpmnGraph.nodes[nodeId];
			g.setNode(node.id, {"label": node.name});				
		}
		
		for (let edge of ordered["edgesId"]) {
			g.setEdge(edge[0], edge[1], {})
		}
		
		g.graph().rankDir = 'LR';
		if (nodesep != null) {
			g.graph().nodesep = nodesep;
		}
		if (edgesep != null) {
			g.graph().edgesep = edgesep;
		}
		if (ranksep != null) {
			g.graph().ranksep = ranksep;
		}

		let render = new dagreD3Obj.render();
		
		let svg = d3Obj.select(targetSvg);
		let inner = svg.append(targetInner);
		render(inner, g);
		
		for (let nodeId in g._nodes) {
			let node = g._nodes[nodeId];
			let elemStr = node.elem.innerHTML;
			let width = parseInt(elemStr.split('width=\"')[1].split('\"')[0]);
			let height = parseInt(elemStr.split('height=\"')[1].split('\"')[0]);
			bpmnGraph.nodes[nodeId].bounds = {"x": node.x - width/2, "y": node.y - height/2, "width": width, "height": height};
		}
		
		
		for (let edgeId in g._edgeLabels) {
			let graphEdgeObj = g._edgeObjs[edgeId];
			graphEdgeObj = [graphEdgeObj.v, graphEdgeObj.w];
			let graphEdge = g._edgeLabels[edgeId];
			let edge = g._edgeLabels[edgeId];
			bpmnGraph.edges[ordered["invMap"][graphEdgeObj]].waypoints = null;
			bpmnGraph.edges[ordered["invMap"][graphEdgeObj]].waypoints = [];
			for (let p of edge.points) {
				bpmnGraph.edges[ordered["invMap"][graphEdgeObj]].waypoints.push([p["x"], p["y"]]);
			}
		}
		
		return bpmnGraph;
	}
}

try {
	require('../../../pm4js.js');
	require('../bpmn_graph.js');
	module.exports = {DagreBPMNLayouting: DagreBPMNLayouting};
	global.DagreBPMNLayouting = DagreBPMNLayouting;
}
catch (err) {
	// not in Node
	//console.log(err);
}


class StatisticsUtils {
	static average(x) {
		if (x.length > 0) {
			let ret = 0.0;
			for (let el of x) {
				ret += el;
			}
			return ret / x.length;
		}
		return 0.0;
	}
	
	static stddev(x) {
		let avg = StatisticsUtils.average(x);
		if (x.length > 0) {
			let ret = 0.0;
			for (let el of x) {
				ret += (el - avg)*(el-avg);
			}
			ret = ret / x.length;
			ret = Math.sqrt(ret);
			return ret;
		}
		return 0.0;
	}
	
	static covariance(x, y) {
		if (x.length != y.length) {
			throw "Incompatible dimensions";
		}
		else if (x.length > 0) {
			let avgX = StatisticsUtils.average(x);
			let avgY = StatisticsUtils.average(y);
			let ret = 0.0;
			let i = 0;
			while (i < x.length) {
				ret += (x[i] - avgX) * (y[i] - avgY);
				i = i + 1;
			}
			ret = ret / x.length;
			return ret;
		}
		return 0.0;
	}
	
	static pearsonCorrelation(x, y) {
		return StatisticsUtils.covariance(x, y) / (StatisticsUtils.stddev(x) * StatisticsUtils.stddev(y));
	}
}

try {
	require('../../pm4js.js');
	module.exports = {StatisticsUtils: StatisticsUtils};
	global.StatisticsUtils = StatisticsUtils;
}
catch (err) {
	// not in node
	//console.log(err);
}



class OcelGeneralFiltering {
	static filterRelatedEvents(ocel, relObjs) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			let inte = [];
			for (let objId of eve["ocel:omap"]) {
				if (relObjs.includes(objId)) {
					inte.push(objId);
				}
			}
			if (inte.length > 0) {
				for (let objId of eve["ocel:omap"]) {
					if (!(objId in filteredOcel["ocel:objects"])) {
						filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
					}
				}
				filteredOcel["ocel:events"][eveId] = eve;
			}
		}
		return filteredOcel;
	}
	
	static filterNonRelatedEvents(ocel, positive, negative) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			let inte = [];
			let inte2 = [];
			for (let objId of eve["ocel:omap"]) {
				if (positive.includes(objId)) {
					inte.push(objId);
				}
				if (negative.includes(objId)) {
					inte2.push(objId);
				}
			}
			if (inte.length > 0 && inte2.length == 0) {
				for (let objId of eve["ocel:omap"]) {
					if (!(objId in filteredOcel["ocel:objects"])) {
						filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
					}
				}
				filteredOcel["ocel:events"][eveId] = eve;
			}
		}
		return filteredOcel;
	}
	
	static filterObjectTypes(ocel, objTypes) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = objTypes;
		filteredOcel["ocel:objects"] = {};
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			if (objTypes.includes(obj["ocel:type"])) {
				filteredOcel["ocel:objects"][objId] = obj;
			}
		}
		filteredOcel["ocel:events"] = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			let relObj = [];
			for (let objId of eve["ocel:omap"]) {
				if (objId in filteredOcel["ocel:objects"]) {
					relObj.push(objId);
				}
			}
			if (relObj.length > 0) {
				let newEve = {};
				newEve["ocel:activity"] = eve["ocel:activity"];
				newEve["ocel:timestamp"] = eve["ocel:timestamp"];
				newEve["ocel:vmap"] = eve["ocel:vmap"];
				newEve["ocel:omap"] = relObj;
				filteredOcel["ocel:events"][eveId] = newEve;
			}
		}
		return filteredOcel;
	}
	
	static filterOtRateUniqueActivities(ocel, minRate) {
		let lif = {};
		let lifUnq = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
			lifUnq[objId] = {}
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(eve["ocel:activity"]);
				lifUnq[objId][eve["ocel:activity"]] = 0;
			}
		}
		let objOt = {};
		let objectTypes = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objOt[objId] = obj["ocel:type"];
			objectTypes[obj["ocel:type"]] = 0;
		}
		objectTypes = Object.keys(objectTypes);
		let otEvents = {};
		let otUnqAct = {}
		for (let objId in lif) {
			let ot = objOt[objId];
			if (!(ot in otEvents)) {
				otEvents[ot] = 0;
				otUnqAct[ot] = 0;
			}
			otEvents[ot] += lif[objId].length;
			otUnqAct[ot] += Object.keys(lifUnq[objId]).length;
		}
		let includedTypes = [];
		for (let ot of objectTypes) {
			let rate = otUnqAct[ot] / otEvents[ot];
			if (rate > minRate) {
				includedTypes.push(ot);
			}
		}
		return OcelGeneralFiltering.filterObjectTypes(ocel, includedTypes);
	}
	
	static filterOtMinNumRelatedEvents(ocel, minCount) {
		let relEveOt = GeneralOcelStatistics.eventsRelatedPerObjectTypeCount(ocel);
		let retTypes = [];
		for (let ot in relEveOt) {
			if (relEveOt[ot] >= minCount) {
				retTypes.push(ot);
			}
		}
		return OcelGeneralFiltering.filterObjectTypes(ocel, retTypes);
	}
	
	static filterOtMinNumRelatedObjects(ocel, minCount) {
		let relObjOt = GeneralOcelStatistics.objectsPerTypeCount(ocel);
		let retTypes = [];
		for (let ot in relObjOt) {
			if (relObjOt[ot] >= minCount) {
				retTypes.push(ot);
			}
		}
		return OcelGeneralFiltering.filterObjectTypes(ocel, retTypes);
	}
	
	static filterMinOccActivities(ocel, minCount) {
		let evPerActCount = GeneralOcelStatistics.eventsPerActivityCount(ocel);
		let keepActivities = [];
		for (let act in evPerActCount) {
			if (evPerActCount[act] >= minCount) {
				keepActivities.push(act);
			}
		}
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
				
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			if (keepActivities.includes(eve["ocel:activity"])) {
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterEssentialEvents(ocel) {
		let essentialEvents = GeneralOcelStatistics.getEssentialEventsWithCategorization(ocel);
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			if (evId in essentialEvents) {
				let eve = ocel["ocel:events"][evId];
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterEssentialEventsOrMinActCount(ocel, minCount) {
		let essentialEvents = GeneralOcelStatistics.getEssentialEventsWithCategorization(ocel);
		let evPerActCount = GeneralOcelStatistics.eventsPerActivityCount(ocel);
		let keepActivities = [];
		for (let act in evPerActCount) {
			if (evPerActCount[act] >= minCount) {
				keepActivities.push(act);
			}
		}
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			if (keepActivities.includes(eve["ocel:activity"]) || evId in essentialEvents) {
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterConnComp(ocel, connComp, selectedConnCompIdx) {
		let cc = connComp[selectedConnCompIdx];
		
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			if (cc.includes(evId)) {
				let eve = ocel["ocel:events"][evId];
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static sampleEventLog(ocel, connComp) {
		let keys = Object.keys(connComp);
		let selectedKey = keys[ keys.length * Math.random() << 0];
		return OcelGeneralFiltering.filterConnComp(ocel, connComp, selectedKey);
	}
	
	static projectOnArrayObjects(ocel, robi) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let roFound = false;
			for (let objId of eve["ocel:omap"]) {
				if (robi.includes(objId)) {
					roFound = true;
				}
			}
			if (roFound) {
				filteredOcel["ocel:events"][evId] = {"ocel:activity": eve["ocel:activity"], "ocel:timestamp": eve["ocel:timestamp"], "ocel:vmap": eve["ocel:vmap"], "ocel:omap": []};
				for (let objId of eve["ocel:omap"]) {
					if (robi.includes(objId)) {
						filteredOcel["ocel:events"][evId]["ocel:omap"].push(objId);
						filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
					}
				}
			}
		}
		
		return filteredOcel;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelGeneralFiltering: OcelGeneralFiltering};
	global.OcelGeneralFiltering = OcelGeneralFiltering;
}
catch (err) {
	// not in Node
}


